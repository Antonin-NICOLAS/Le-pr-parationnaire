import User from '../models/User.js'
import mongoose from 'mongoose'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { SessionService } from '../services/SessionService.js'
import type { Request, Response } from 'express'
import i18next, { TFunction } from 'i18next'
// WebAuthn
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import type {
  WebAuthnCredential,
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  GenerateAuthenticationOptionsOpts,
  GenerateRegistrationOptionsOpts,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifyAuthenticationResponseOpts,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server'

// Helpers
import {
  comparePassword,
  getDeviceInfo,
  findLocation,
} from '../helpers/AuthHelpers.js'
import {
  generateBackupCodes,
  rotateBackupCodes,
} from '../helpers/2FAHelpers.js'
import {
  setChallenge,
  getActiveCredentials,
  clearChallenge,
  findCredentialById,
  updateCredentialCounter,
} from '../helpers/WebAuthnHelpers.js'
import { assertUserExists } from '../helpers/General.js'
// Emails
import { sendLoginEmail } from '../emails/SendMail.js'

// Configuration WebAuthn
let rpName = 'Le préparationnaire'
let rpID = process.env.DOMAIN || 'localhost'
let PORT = Number(process.env.FRONT_PORT || 5173)
let origin =
  process.env.NODE_ENV === 'production'
    ? `https://${rpID}`
    : `http://${rpID}:${PORT}`

// Utils
type Ctx = 'primary' | 'secondary'
const parseContext = (raw: any): Ctx | null =>
  raw === 'primary' ? 'primary' : raw === 'secondary' ? 'secondary' : null

const getContainer = (user: any, ctx: Ctx) =>
  ctx === 'primary' ? user.authMethods.webauthn : user.twoFactor.webauthn

// ----------------- Registration -----------------
export const generateRegistrationOpt = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    // 1. User
    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)

    // 2. Existing credentials
    const activeCredentials = getActiveCredentials(container)

    // Cas: des clés existent mais container pas activé -> activer sans relancer process
    if (activeCredentials.length >= 1 && !container.isEnabled) {
      container.isEnabled = true
      if (ctx === 'secondary') {
        // activer la 2FA globale si rien n’était actif
        if (!user.twoFactor.isEnabled) user.twoFactor.isEnabled = true
        // si aucune autre méthode n’est active, créer des backup codes
        if (!user.twoFactor.app.isEnabled && !user.twoFactor.email.isEnabled) {
          if (!user.twoFactor.backupCodes?.length) {
            user.twoFactor.backupCodes = generateBackupCodes(8)
          }
        }
        if (user.twoFactor.preferredMethod === 'none') {
          user.twoFactor.preferredMethod = 'webauthn'
        }
      }
      await user.save()
      return ApiResponse.success(
        res,
        { RequiresSetName: false },
        t('auth:success.webauthn.existing_credential'),
        200,
      )
    }

    // 3. Registration options
    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID: isoBase64URL.toBuffer(req.user._id.toString()),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: activeCredentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports || [],
      })),
      authenticatorSelection: {
        userVerification: ctx === 'primary' ? 'required' : 'preferred',
        requireResidentKey: false,
      },
      timeout: 60000,
      supportedAlgorithmIDs: [-7, -257],
      extensions: { credProps: true },
    }
    const options = await generateRegistrationOptions(opts)

    // 4. Persist challenge
    setChallenge(container, options.challenge)
    await user.save()

    return ApiResponse.success(
      res,
      { options },
      t('auth:success.webauthn.registration_options_generated'),
      200,
    )
  },
)

export const verifyRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const attestationResponse: RegistrationResponseJSON =
      req.body.attestationResponse
    if (!attestationResponse) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.challenge_expired'),
        400,
      )
    }

    // 1. User
    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)

    // 2. Verify attestation
    let verification: VerifiedRegistrationResponse
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response: attestationResponse,
        expectedChallenge: container.challenge ?? '',
        expectedOrigin: origin,
        expectedRPID: rpID,
      }
      verification = await verifyRegistrationResponse(opts)
    } catch (error) {
      console.error('Erreur vérification enregistrement:', error)
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.registration_error'),
        400,
      )
    }

    const { verified, registrationInfo } = verification
    if (!verified || !registrationInfo) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.registration_failed'),
        400,
      )
    }

    // 3. Deduplicate
    const credential: WebAuthnCredential = registrationInfo.credential
    const existingCredential = await findCredentialById(
      container,
      credential.id,
    )
    if (existingCredential) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_exists'),
        400,
      )
    }

    // 4. Build new credential
    const mappedDeviceType = (registrationInfo as any).credentialDeviceType
      ? (registrationInfo as any).credentialDeviceType === 'multiDevice'
        ? 'security-key'
        : 'platform'
      : attestationResponse.clientExtensionResults?.credProps?.rk
      ? 'security-key'
      : 'platform'

    const newCredential = {
      id: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: Number(credential.counter || 0),
      transports: attestationResponse.response.transports || [],
      deviceType: mappedDeviceType as 'platform' | 'security-key',
      deviceName: t('auth:new_key'),
      createdAt: new Date(),
      lastUsed: undefined as Date | undefined,
    }

    // 5. Persist
    container.credentials.push(newCredential)
    container.isEnabled = true
    clearChallenge(container)

    if (ctx === 'secondary') {
      if (!user.twoFactor.isEnabled) user.twoFactor.isEnabled = true
      if (user.twoFactor.preferredMethod === 'none') {
        user.twoFactor.preferredMethod = 'webauthn'
      }
      // Ne génère/rotate que si nécessaire
      if (!user.twoFactor.backupCodes?.length) {
        user.twoFactor.backupCodes = generateBackupCodes(8)
      } else {
        rotateBackupCodes(user)
      }
    }

    await user.save()

    const basePayload = {
      RequiresSetName: true,
      credentialId: newCredential.id,
      credentials: container.credentials,
    }
    const secondaryPayload =
      ctx === 'secondary'
        ? {
            preferredMethod: user.twoFactor.preferredMethod,
            backupCodes: user.twoFactor.backupCodes,
          }
        : {}

    return ApiResponse.success(
      res,
      { ...basePayload, ...secondaryPayload },
      t('auth:success.webauthn.registration_response_successful'),
      200,
    )
  },
)

// ----------------- Authentication (login) -----------------
export const generateAuthenticationOpt = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const email = String(req.query.email || '')
      .trim()
      .toLowerCase()
    if (!email)
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)

    // 1. User
    const user = await User.findOne({ email }).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)

    // 2. Guard
    if (!container.isEnabled || container.credentials.length === 0) {
      return ApiResponse.error(res, t('auth:errors.webauthn.not_enabled'), 400)
    }

    // 3. Options
    const opts: GenerateAuthenticationOptionsOpts = {
      rpID,
      allowCredentials: container.credentials
        .filter((cred: WebAuthnCredential) => typeof cred.id === 'string')
        .map((cred: WebAuthnCredential) => ({
          id: cred.id,
          type: 'public-key',
          transports: cred.transports,
        })),
      userVerification: ctx === 'primary' ? 'required' : 'preferred',
      timeout: 60000,
    }
    const options = await generateAuthenticationOptions(opts)

    // 4. Persist challenge
    setChallenge(container, options.challenge)
    await user.save()

    return ApiResponse.success(res, { options })
  },
)

export const verifyAuthentication = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const { email, rememberMe } = req.body
    const assertionResponse: AuthenticationResponseJSON =
      req.body.assertionResponse
    if (!assertionResponse) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.authentication'),
        400,
      )
    }

    // 1. User
    const user = await User.findOne({
      email: String(email || '').toLowerCase(),
    }).select('+twoFactor.webauthn +authMethods.webauthn')
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)

    // 2. Get credential
    const credentialId = assertionResponse.rawId || assertionResponse.id
    const dbCredential = findCredentialById(container, credentialId)
    if (!dbCredential) {
      console.error('FindCredentialById : Credential not found')
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_not_found'),
        404,
      )
    }

    // 3. Verify assertion
    let verification: VerifiedAuthenticationResponse
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: assertionResponse,
        expectedChallenge: container.challenge || '',
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: dbCredential.id,
          publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
          counter: Number(dbCredential.counter),
          transports: dbCredential.transports || [],
        },
      }
      verification = await verifyAuthenticationResponse(opts)
    } catch (error) {
      console.error('Erreur vérification authentification:', error)
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.authentication'),
        400,
      )
    }

    if (!verification.verified) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.authentication'),
        400,
      )
    }

    // 4. Post-verify updates
    updateCredentialCounter(
      container,
      credentialId,
      Number(verification.authenticationInfo.newCounter),
    )
    clearChallenge(container)

    // 5. 2FA gate (si la 2FA globale est active)
    if (user.twoFactor.isEnabled && ctx === 'primary') {
      return ApiResponse.info(
        res,
        {
          requiresTwoFactor: true,
          twoFactor: {
            email: user.twoFactor.email.isEnabled,
            app: user.twoFactor.app.isEnabled,
            webauthn: user.twoFactor.webauthn.isEnabled,
            preferredMethod: user.twoFactor.preferredMethod,
          },
        },
        t('auth:errors.two_factor_required'),
        202,
      )
    }

    // 6. Create session
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const {
        accessToken,
        refreshToken,
        session: userSession,
      } = await SessionService.createSessionWithTokens(
        user,
        req,
        res,
        rememberMe,
      )

      user.lastLogin = new Date()
      await user.save({ session })
      await session.commitTransaction()

      const deviceInfo = getDeviceInfo(userSession.userAgent)
      const localisation = await findLocation(
        t,
        i18next.language,
        userSession.ip,
      )

      // 7. Send login email notification
      await sendLoginEmail(
        t as TFunction,
        user,
        userSession.ip,
        deviceInfo,
        localisation,
      )

      return ApiResponse.success(
        res,
        { accessToken, refreshToken },
        t('auth:success.logged_in'),
        200,
      )
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  },
)

// ----------------- Devices management -----------------
export const nameWebAuthnCredential = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const { id: credentialId, deviceName } = req.body

    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    if (
      !deviceName ||
      typeof deviceName !== 'string' ||
      deviceName.trim() === ''
    ) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    const container = getContainer(user, ctx)
    const credential = container.credentials.find(
      (c: any) => c.id === credentialId,
    )
    if (!credential) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_not_found'),
        404,
      )
    }

    credential.deviceName = deviceName
    await user.save()

    return ApiResponse.success(res, {}, '', 200)
  },
)

export const removeWebAuthnCredential = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const { id: credentialId } = req.params

    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)
    const idx = container.credentials.findIndex(
      (c: any) => c.id === credentialId,
    )
    if (idx === -1) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_not_found'),
        404,
      )
    }

    container.credentials.splice(idx, 1)

    if (container.credentials.length === 0) {
      container.isEnabled = false

      if (ctx === 'secondary') {
        // recalcul de l’état 2FA (sans webauthn)
        user.twoFactor.isEnabled =
          user.twoFactor.app.isEnabled || user.twoFactor.email.isEnabled

        if (user.twoFactor.preferredMethod === 'webauthn') {
          user.twoFactor.preferredMethod = user.twoFactor.app.isEnabled
            ? 'app'
            : user.twoFactor.email.isEnabled
            ? 'email'
            : 'none'
        }

        if (!user.twoFactor.app.isEnabled && !user.twoFactor.email.isEnabled) {
          user.twoFactor.backupCodes = []
          user.twoFactor.preferredMethod = 'none'
        }
      }
    }

    await user.save()

    const basePayload = { credentials: container.credentials }
    const secondaryPayload =
      ctx === 'secondary'
        ? {
            preferredMethod: user.twoFactor.preferredMethod,
            backupCodes: user.twoFactor.backupCodes,
          }
        : {}

    return ApiResponse.success(
      res,
      { ...basePayload, ...secondaryPayload },
      t('auth:success.webauthn.credential_removed'),
      200,
    )
  },
)

export const getWebAuthnDevices = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)
    return ApiResponse.success(res, {
      credentials: container.credentials || [],
    })
  },
)

// ----------------- Disable -----------------
export const disableWebAuthn = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const ctx = parseContext(req.query.context)
    if (!ctx) return ApiResponse.error(res, t('common:errors.bad_request'), 400)

    const { method, value } = req.body
    if (!method || !value) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const container = getContainer(user, ctx)
    if (!container.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.webauthn.not_enabled'), 400)
    }

    // Re-auth
    let isValid = false
    try {
      if (method === 'password') {
        isValid = await comparePassword(value, user.password)
      } else if (method === 'webauthn') {
        if (!value || typeof value !== 'object') {
          return ApiResponse.error(
            res,
            t('auth:errors.webauthn.credential_not_found'),
            400,
          )
        }
        const credentialId = value.rawId || value.id
        if (!credentialId) {
          return ApiResponse.error(
            res,
            t('auth:errors.webauthn.credential_not_found'),
            400,
          )
        }
        const dbCredential = findCredentialById(container, credentialId)
        if (!dbCredential) {
          return ApiResponse.error(
            res,
            t('auth:errors.webauthn.credential_not_found'),
            404,
          )
        }
        let verification: VerifiedAuthenticationResponse
        try {
          const opts: VerifyAuthenticationResponseOpts = {
            response: value,
            expectedChallenge: container.challenge || '',
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
              id: dbCredential.id,
              publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
              counter: Number(dbCredential.counter),
              transports: dbCredential.transports || [],
            },
          }
          verification = await verifyAuthenticationResponse(opts)
        } catch (error) {
          console.error('Erreur vérification authentification:', error)
          return ApiResponse.error(
            res,
            t('auth:errors.webauthn.authentication'),
            400,
          )
        }
        isValid = verification.verified
      } else {
        return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      return ApiResponse.error(res, t('common:errors.server_error'), 500)
    }

    if (!isValid) {
      return ApiResponse.error(
        res,
        method === 'password'
          ? t('auth:errors.password_incorrect')
          : t('auth:errors.webauthn.authentication'),
        400,
      )
    }

    // Disable
    container.isEnabled = false
    if (ctx === 'secondary') {
      user.twoFactor.isEnabled =
        user.twoFactor.app.isEnabled || user.twoFactor.email.isEnabled

      if (user.twoFactor.preferredMethod === 'webauthn') {
        user.twoFactor.preferredMethod = user.twoFactor.app.isEnabled
          ? 'app'
          : user.twoFactor.email.isEnabled
          ? 'email'
          : 'none'
      }

      if (!user.twoFactor.app.isEnabled && !user.twoFactor.email.isEnabled) {
        user.twoFactor.backupCodes = []
        user.twoFactor.preferredMethod = 'none'
      }
    }

    await user.save()

    return ApiResponse.success(
      res,
      {
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes || [],
      },
      t('auth:success.webauthn.disabled'),
      200,
    )
  },
)

// ----------------- Transfer (copy) -----------------
export const transferWebAuthnCredentials = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { fromContext, toContext } = req.body
    const src = parseContext(fromContext)
    const dst = parseContext(toContext)
    if (!src || !dst)
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    if (src === dst)
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.transfer_same_context'),
        400,
      )

    const user = await User.findById(req.user._id).select(
      '+twoFactor.webauthn +authMethods.webauthn',
    )
    if (!assertUserExists(user, res, t)) return

    const source = getContainer(user, src)
    const target = getContainer(user, dst)

    const toAdd = source.credentials.filter(
      (cred: any) => !target.credentials.some((c: any) => c.id === cred.id),
    )

    target.credentials.push(...toAdd)
    target.isEnabled = target.credentials.length > 0

    if (dst === 'secondary') {
      if (!user.twoFactor.isEnabled) user.twoFactor.isEnabled = true
      if (user.twoFactor.preferredMethod === 'none')
        user.twoFactor.preferredMethod = 'webauthn'
      if (!user.twoFactor.backupCodes?.length) {
        user.twoFactor.backupCodes = generateBackupCodes(8)
      } else {
        rotateBackupCodes(user)
      }
    } else if (dst === 'primary') {
      if (!user.authMethods.webauthn.isEnabled)
        user.authMethods.webauthn.isEnabled = true
    }

    const basePayload = {
      credentials: target.credentials,
    }
    const secondaryPayload =
      dst === 'secondary'
        ? {
            preferredMethod: user.twoFactor.preferredMethod,
            backupCodes: user.twoFactor.backupCodes,
          }
        : {}

    await user.save()
    return ApiResponse.success(res, { ...basePayload, ...secondaryPayload })
  },
)
