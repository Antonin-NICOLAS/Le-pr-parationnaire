import User from '../models/User.js'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { SessionService } from '../services/SessionService.js'
import type { Request, Response } from 'express'
import i18next, { TFunction } from 'i18next'
// Helpers
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

import {
  validateEmail,
  comparePassword,
  generateCookie,
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
// Emails
import { sendLoginEmail } from '../emails/SendMail.js'

// Configuration WebAuthn
let rpName = 'Le préparationnaire'
let rpID = process.env.DOMAIN || 'localhost'
let PORT = 5173
let origin =
  process.env.NODE_ENV === 'production'
    ? `https://${rpID}`
    : `http://${rpID}:${PORT}`

export const generateRegistrationOpt = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    // 1. Vérification de l'utilisateur
    const user = await User.findById(req.user._id).select('+twoFactor.webauthn')
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Récupération des clés existantes
    const activeCredentials = getActiveCredentials(user)

    if (activeCredentials.length >= 1 && !user.twoFactor.webauthn.isEnabled) {
      if (!user.twoFactor.app.isEnabled && !user.twoFactor.email.isEnabled) {
        user.twoFactor.backupCodes = generateBackupCodes(8)
      }
      user.twoFactor.webauthn.isEnabled = true
      await user.save()
      return ApiResponse.success(res, {})
    }

    // 3. Génération des options d'enregistrement
    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID: isoBase64URL.toBuffer(req.user._id.toString()),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: activeCredentials.map((passkey) => ({
        id: passkey.id,
        type: 'public-key',
        transports: passkey.transports || [],
      })),
      authenticatorSelection: {
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      timeout: 60000,
      supportedAlgorithmIDs: [-7, -257],
      extensions: {
        credProps: true, // Pour détecter si c'est une clé de sécurité ou une plateforme
      },
    }
    const options = await generateRegistrationOptions(opts)

    // 4. Stockage sécurisé du challenge
    setChallenge(user, options.challenge)
    await user.save()

    return ApiResponse.success(
      res,
      { options },
      t('auth.success.webauthn.registration_options_generated'),
      200,
    )
  },
)

export const verifyRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const attestationResponse: RegistrationResponseJSON =
      req.body.attestationResponse

    // 1. Vérification de l'utilisateur
    const user = await User.findById(req.user._id).select('+twoFactor.webauthn')
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Validation des données d'entrée
    if (!attestationResponse) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.challenge_expired'),
        400,
      )
    }

    // 3. Vérification de la réponse d'enregistrement
    let verification: VerifiedRegistrationResponse
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response: attestationResponse,
        expectedChallenge: user?.twoFactor.webauthn?.challenge ?? '',
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

    if (verified && registrationInfo) {
      const credential: WebAuthnCredential = registrationInfo.credential
      // 4. On vérifie si la clé est deja enregistrée
      const existingCredential = await findCredentialById(user, credential.id)
      if (existingCredential) {
        return ApiResponse.error(
          res,
          t('auth:errors.webauthn.credential_exists'),
          400,
        )
      }

      // 5. Création du nouveau credential
      const newCredential = {
        id: credential.id,
        publicKey: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter || 0,
        transports: attestationResponse.response.transports || [],
        deviceType: attestationResponse.clientExtensionResults?.credProps?.rk
          ? 'security-key'
          : 'platform',
        deviceName: t('auth:new_key'),
        createdAt: new Date(),
        lastUsed: undefined,
      }

      // 6. Mise à jour de l'utilisateur
      user.twoFactor.webauthn.credentials.push(newCredential)
      clearChallenge(user)

      user.twoFactor.webauthn.isEnabled = true

      rotateBackupCodes(user)

      // Définition de la méthode préférée si aucune n'est définie
      if (user.twoFactor.preferredMethod === 'none') {
        user.twoFactor!.preferredMethod = 'webauthn'
      }

      await user.save()

      return ApiResponse.success(
        res,
        {
          credentialId: newCredential.id,
          credentials: user.twoFactor.webauthn.credentials,
          preferredMethod: user.twoFactor.preferredMethod,
          backupCodes: user.twoFactor.backupCodes,
        },
        t('auth:success.webauthn.registration_response_successful'),
        200,
      )
    } else {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.registration_failed'),
        400,
      )
    }
  },
)

export const generateAuthenticationOpt = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query
    const { t } = req

    // 1. Récupération de l'utilisateur
    const user = await User.findOne({ email }).select('+twoFactor.webauthn')
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérification que WebAuthn est activé
    if (
      !user.twoFactor.webauthn.isEnabled ||
      user.twoFactor.webauthn.credentials.length === 0
    ) {
      return ApiResponse.error(res, t('auth:errors.webauthn.not_enabled'), 400)
    }

    // 3. Génération des options d'authentification
    const opts: GenerateAuthenticationOptionsOpts = {
      rpID,
      allowCredentials: user.twoFactor.webauthn.credentials
        .filter((cred) => typeof cred.id === 'string')
        .map((cred) => ({
          id: cred.id,
          type: 'public-key',
          transports: cred.transports,
        })),
      userVerification: 'preferred',
      timeout: 60000,
    }
    const options = await generateAuthenticationOptions(opts)

    // 4. Stockage du challenge
    setChallenge(user, options.challenge)
    await user.save()

    return ApiResponse.success(res, { options })
  },
)

export const verifyAuthentication = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, rememberMe, assertionResponse } = req.body
    const { t } = req

    // 1. Validation des données d'entrée
    if (!assertionResponse) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.authentication'),
        400,
      )
    }

    // 2. Trouver l'utilisateur
    const credentialId = assertionResponse.rawId || assertionResponse.id
    const user = await User.findOne({ email }).select('+twoFactor.webauthn')

    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }
    console.log(user.twoFactor.webauthn.credentials, credentialId)

    // 4. Récupération du credential
    const dbCredential = findCredentialById(user, credentialId)
    if (!dbCredential) {
      console.error('FindCredentialById : Credential not found')
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_not_found'),
        404,
      )
    }

    // 5. Vérification de la réponse d'authentification
    let verification: VerifiedAuthenticationResponse
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: assertionResponse,
        expectedChallenge: user?.twoFactor.webauthn?.challenge || '',
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

    // 6. Si vérification réussie
    if (verification.verified) {
      // Mise à jour du compteur et dernière utilisation
      updateCredentialCounter(
        user,
        credentialId,
        verification.authenticationInfo.newCounter,
      )
      clearChallenge(user)

      const session = await SessionService.createOrUpdateSession(
        user,
        req,
        rememberMe,
      )
      user.lastLogin = new Date()
      await user.save()

      // Génération des cookies avec le sessionId
      generateCookie(res, user, rememberMe, session.sessionId)

      const deviceInfo = getDeviceInfo(session.userAgent)
      const localisation = await findLocation(t, i18next.language, session.ip)

      // 7. Send login email notification
      await sendLoginEmail(
        t as TFunction,
        user,
        session.ip,
        deviceInfo,
        localisation,
      )

      return ApiResponse.success(res, {}, t('auth:success.logged_in'), 200)
    } else {
      return ApiResponse.error(
        res,
        t('auth.errors.webauthn.authentication'),
        400,
      )
    }
  },
)

// Nommer une clé WebAuthn
export const nameWebAuthnCredential = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { id: credentialId } = req.body

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si la clé demandée existe
    const credential = user.twoFactor.webauthn.credentials.find(
      (cred) => cred.id === credentialId,
    )
    if (!credential) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_not_found'),
        404,
      )
    }

    // 3. Mettre à jour le nom de la clé
    const { deviceName } = req.body
    if (
      !deviceName ||
      typeof deviceName !== 'string' ||
      deviceName.trim() === ''
    ) {
      return ApiResponse.error(res, t('auth:errors.invalid_name'), 400)
    }
    credential.deviceName = deviceName
    await user.save()

    return ApiResponse.success(res, {}, t('auth:success.name_updated'), 200)
  },
)

// Supprimer une clé WebAuthn
export const removeWebAuthnCredential = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: credentialId } = req.params
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si la clé demandée existe
    const credentialIndex = user.twoFactor.webauthn.credentials.findIndex(
      (cred) => cred.id === credentialId,
    )

    if (credentialIndex === -1) {
      return ApiResponse.error(
        res,
        t('auth:errors.webauthn.credential_not_found'),
        404,
      )
    }

    // 4. Supprimer la clé
    user.twoFactor.webauthn.credentials.splice(credentialIndex, 1)

    // 5. Si aucune clé WebAuthn n'est restante, on désactive WebAuthn
    if (user.twoFactor.webauthn.credentials.length === 0) {
      user.twoFactor.webauthn.isEnabled = false

      // 6. Si WebAuthn est la méthode préférée, on la remplace par la méthode suivante disponible
      if (user.twoFactor.preferredMethod === 'webauthn') {
        user.twoFactor.preferredMethod = user.twoFactor.app.isEnabled
          ? 'app'
          : user.twoFactor.email.isEnabled
          ? 'email'
          : 'none'
      }

      // 7. Si aucune autre méthode n'est disponible, on supprime les codes de sauvegarde
      if (!user.twoFactor.app.isEnabled && !user.twoFactor.email.isEnabled) {
        user.twoFactor.backupCodes = []
        user.twoFactor.preferredMethod = 'none'
      }
    }

    await user.save()

    return ApiResponse.success(
      res,
      {
        credentials: user.twoFactor.webauthn.credentials,
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes,
      },
      t('auth:success.webauthn.credential_removed'),
      200,
    )
  },
)

export const getWebAuthnDevices = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    return ApiResponse.success(res, {
      credentials: user.twoFactor.webauthn.credentials || [],
    })
  },
)

export const disableWebAuthn = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { method, value } = req.body
    if (!method || !value) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }
    // 2. Vérifier si webauthn est activé
    if (!user.twoFactor.webauthn.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.webauthn.not_enabled'), 400)
    }

    // 3. Vérifier le mot de passe ou le code de vérification
    let isValid = false
    if (method === 'password') {
      // Vérification du mot de passe
      isValid = await comparePassword(value, user.password)
    } else if (method === 'webauthn' && user.twoFactor.webauthn.isEnabled) {
      // Vérification de la réponse WebAuthn
      const credentialId = value.rawId || value.id
      // Récupération de l'ID du credential correspondant
      const dbCredential = findCredentialById(user, credentialId)
      if (!dbCredential) {
        return ApiResponse.error(
          res,
          t('auth:errors.webauthn.credential_not_found'),
          404,
        )
      }
      // Vérification de la réponse d'authentification
      let verification: VerifiedAuthenticationResponse
      try {
        const opts: VerifyAuthenticationResponseOpts = {
          response: value,
          expectedChallenge: user?.twoFactor.webauthn.challenge || '',
          expectedOrigin: origin,
          expectedRPID: rpID,
          credential: {
            id: dbCredential.id,
            publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
            counter: dbCredential.counter,
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

    if (!isValid) {
      return ApiResponse.error(
        res,
        method === 'password'
          ? t('auth:errors.password_incorrect')
          : t('auth.errors.webauthn.authentication'),
        400,
      )
    }

    // 4. Désactiver WebAuthn
    user.twoFactor.webauthn.isEnabled = false

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
