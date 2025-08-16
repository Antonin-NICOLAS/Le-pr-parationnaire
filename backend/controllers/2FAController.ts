import User, { type IUser } from '../models/User.js'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { SessionService } from '../services/SessionService.js'
import type { Request, Response } from 'express'
import i18next, { TFunction } from 'i18next'
// Helpers
import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorCode,
  rotateBackupCodes,
  verifyBackupCode,
  hashEmailCode,
  compareEmailCode,
  validatePreferredMethod,
  isCodeExpired,
  generateSecureCode,
  getErrorMessageForMethod,
  verifySecondFactor,
} from '../helpers/2FAHelpers.js'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { findCredentialById } from '../helpers/WebAuthnHelpers.js'
import type {
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import { comparePassword, getDeviceInfo } from '../helpers/AuthHelpers.js'
import { assertUserExists } from '../helpers/General.js'
// Emails
import { sendTwoFactorEmail, sendLoginEmail } from '../emails/SendMail.js'
// .env
import dotenv from 'dotenv'
dotenv.config()

let rpID = process.env.DOMAIN || 'localhost'
let PORT = Number(process.env.FRONT_PORT || 5173)
let origin =
  process.env.NODE_ENV === 'production'
    ? `https://${rpID}`
    : `http://${rpID}:${PORT}`

// Obtenir le statut de la 2FA
export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user

  return ApiResponse.success(res, {
    isEnabled: user.twoFactor.isEnabled || false,
    email: { isEnabled: user.twoFactor.email.isEnabled || false },
    app: { isEnabled: user.twoFactor.app.isEnabled || false },
    webauthn: { isEnabled: user.twoFactor.webauthn.isEnabled || false },
    preferredMethod: user.twoFactor.preferredMethod || 'none',
    backupCodes: user.twoFactor.backupCodes || [],
    primaryCredentials: user.authMethods.webauthn.credentials || [],
    secondaryCredentials: user.twoFactor.webauthn.credentials || [],
    loginWithWebAuthn: user.authMethods.webauthn.isEnabled || false,
  })
})

// Définir la méthode préférée
export const setPreferredMethod = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { method } = req.body
    if (!method || !validatePreferredMethod(method)) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
    }

    const enabledPathMap = {
      email: 'twoFactor.email.isEnabled',
      app: 'twoFactor.app.isEnabled',
      webauthn: 'twoFactor.webauthn.isEnabled',
    } as const satisfies Record<'email' | 'app' | 'webauthn', string>

    const enabledPath = enabledPathMap[method]
    const result = await User.updateOne(
      { _id: req.user._id, [enabledPath]: true },
      { $set: { 'twoFactor.preferredMethod': method } },
    )
    if (result.matchedCount === 0) {
      const errKey =
        method === 'email'
          ? 'auth:errors.email.not_enabled'
          : method === 'app'
          ? 'auth:errors.app.not_enabled'
          : 'auth:errors.webauthn.not_enabled'
      return ApiResponse.error(res, t(errKey), 400)
    }

    return ApiResponse.success(res, { preferredMethod: method })
  },
)

// Activer la 2FA par application
export const configTwoFactorApp = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user

    if (user.twoFactor?.app?.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.app.already_enabled'), 400)
    }

    const secret = generateTwoFactorSecret()
    const qrCode = await generateQRCode(secret)

    const result = await User.updateOne(
      { _id: user._id, 'twoFactor.app.isEnabled': false }, // Condition atomique
      {
        $set: {
          'twoFactor.app.secret': secret.base32,
          'twoFactor.app.isEnabled': false,
        },
      },
    )

    if (result.matchedCount === 0) {
      throw new Error('Concurrent modification detected')
    }

    return ApiResponse.success(
      res,
      { secret: secret.base32, qrCode },
      t('auth:success.app.setup_initiated'),
      200,
    )
  },
)

// Activer la 2FA par email
export const configTwoFactorEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    const user = req.user

    if (!user.emailVerification?.isVerified) {
      return ApiResponse.info(
        res,
        { requiresVerification: true, email: user.email, rememberMe: false },
        t('auth:errors.email_not_verified'),
        403,
      )
    }
    if (user.twoFactor?.email?.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.email.already_enabled'), 400)
    }

    const code = generateSecureCode()
    const hashed = await hashEmailCode(code)
    const expiration = new Date(Date.now() + 10 * 60 * 1000)

    const result = await User.updateOne(
      {
        _id: user._id,
        'twoFactor.email.isEnabled': false,
        'emailVerification.isVerified': true,
      },
      {
        $set: {
          'twoFactor.email.token': hashed,
          'twoFactor.email.expiration': expiration,
        },
      },
    )

    if (result.matchedCount === 0) {
      return ApiResponse.error(res, 'Email non vérifié ou code expiré', 400)
    }

    await sendTwoFactorEmail(
      t as TFunction,
      user as IUser,
      code,
      expiration.toLocaleString(i18next.language, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      'config',
    )

    return ApiResponse.success(
      res,
      {},
      t('auth:success.email.setup_initiated'),
      200,
    )
  },
)

// Renvoyer le code de vérification par email (pour configuration mais aussi pour authentification et désactivation)
export const resendEmailCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email } = req.body
    const { context } = req.params

    const validContexts = ['config', 'login', 'disable'] as const
    type ValidContext = (typeof validContexts)[number]

    if (!context || !validContexts.includes(context as ValidContext)) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    let user = null
    if (context === 'login') {
      if (!email) {
        return ApiResponse.error(res, t('common:errors.bad_request'), 400)
      }
      user = await User.findOne({ email }).lean()
      if (!assertUserExists(user, res, t)) {
        return
      }
    } else {
      user = req.user
    }
    if (!assertUserExists(user, res, t)) {
      return
    }

    const code = generateSecureCode()
    const hashed = await hashEmailCode(code)
    const expiration = new Date(Date.now() + 10 * 60 * 1000)

    const result = await User.updateOne(
      {
        _id: user._id,
        'emailVerification.isVerified': true,
      },
      {
        $set: {
          'twoFactor.email.token': hashed,
          'twoFactor.email.expiration': expiration,
        },
      },
    )

    if (result.matchedCount === 0) {
      return ApiResponse.info(
        res,
        { requiresVerification: true, email: user.email, rememberMe: false },
        t('auth:errors.email_not_verified'),
        403,
      )
    }

    await sendTwoFactorEmail(
      t as TFunction,
      user,
      code,
      expiration.toLocaleString(i18next.language, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      context as ValidContext,
    )

    const successMessage =
      context === 'config'
        ? t('auth:success.email.code_resend')
        : t('auth:success.code_sent')

    return ApiResponse.success(res, {}, successMessage, 200)
  },
)

// Vérifier et activer la 2FA
export const enableTwoFactorApp = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { code } = req.body

    const user = req.user

    if (!verifyTwoFactorCode(user.twoFactor.app.secret, code)) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }

    const newBackupCodes = rotateBackupCodes(user)

    const shouldUpdatePreferredMethod =
      user.twoFactor?.preferredMethod === 'none'
    const otherMethodsEnabled =
      user.twoFactor.email.isEnabled || user.twoFactor.webauthn.isEnabled

    const result = await User.updateOne(
      {
        _id: user._id,
        'twoFactor.app.secret': { $exists: true },
        'twoFactor.app.isEnabled': false,
      },
      {
        $set: {
          'twoFactor.app.isEnabled': true,
          'twoFactor.backupCodes': newBackupCodes,
          ...(shouldUpdatePreferredMethod && {
            'twoFactor.preferredMethod': 'app',
          }),
          ...(!otherMethodsEnabled && { 'twoFactor.isEnabled': true }),
        },
      },
    )

    if (result.matchedCount === 0) {
      const error = !req.user.twoFactor?.app?.secret
        ? t('auth:errors.2fa.setup_required')
        : t('auth:errors.app.already_enabled')
      return ApiResponse.error(res, error, 400)
    }

    return ApiResponse.success(
      res,
      {
        backupCodes: user.twoFactor.backupCodes,
        preferredMethod: shouldUpdatePreferredMethod
          ? 'app'
          : user.twoFactor?.preferredMethod,
      },
      t('auth:success.app.enabled'),
      200,
    )
  },
)

// Vérifier et activer la 2FA par email
export const enableTwoFactorEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { code } = req.body

    const user = req.user
    const token = user.twoFactor?.email?.token
    const expiration = user.twoFactor?.email?.expiration

    // 2. Vérifications initiales
    if (!token || !expiration) {
      return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
    }

    if (isCodeExpired(expiration)) {
      return ApiResponse.error(res, t('auth:errors.2fa.code_expired'), 400)
    }

    // 3. Vérification du code (coûteuse en CPU, donc tardive)
    if (!(await compareEmailCode(token, code))) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }

    // 4. Préparation des données
    const newBackupCodes = rotateBackupCodes(user)
    const shouldUpdatePreferredMethod =
      user.twoFactor?.preferredMethod === 'none'
    const otherMethodsEnabled =
      user.twoFactor.app.isEnabled || user.twoFactor.webauthn.isEnabled

    // 5. Opération atomique avec toutes les vérifications
    const result = await User.updateOne(
      {
        _id: user._id,
        'twoFactor.email.token': token,
        'twoFactor.email.expiration': expiration,
        'twoFactor.email.isEnabled': false,
      },
      {
        $set: {
          'twoFactor.email.isEnabled': true,
          'twoFactor.backupCodes': newBackupCodes,
          ...(shouldUpdatePreferredMethod && {
            'twoFactor.preferredMethod': 'email',
          }),
          ...(!otherMethodsEnabled && { 'twoFactor.isEnabled': true }),
        },
        $unset: {
          'twoFactor.email.token': 1,
          'twoFactor.email.expiration': 1,
        },
      },
    )

    if (result.matchedCount === 0) {
      return ApiResponse.error(res, t('common:errors.server_error'), 400)
    }

    return ApiResponse.success(
      res,
      {
        backupCodes: newBackupCodes,
        preferredMethod: shouldUpdatePreferredMethod
          ? 'email'
          : user.twoFactor?.preferredMethod,
      },
      t('auth:success.email.enabled'),
      200,
    )
  },
)

// Désactiver la 2FA par application (avec code OTP ou mot de passe)
export const disableTwoFactorApp = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { method, value } = req.body

    // 1. Validation des entrées
    if (!method || !value) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    const user = req.user

    // 2. Vérifications initiales
    if (!user.twoFactor?.app?.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.app.not_enabled'), 400)
    }

    // 3. Vérification des credentials
    let isValid = false
    if (method === 'password') {
      isValid = await comparePassword(value, user.password)
    } else if (method === 'otp') {
      const secret = user.twoFactor?.app?.secret
      if (!secret) {
        return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
      }

      isValid = verifyTwoFactorCode(secret, value)
    } else {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
    }
    if (!isValid) {
      return ApiResponse.error(
        res,
        method === 'password'
          ? t('auth:errors.password_incorrect')
          : t('auth:errors.2fa.invalid_code'),
        400,
      )
    }

    // 4. Préparation des updates
    const otherMethodsEnabled =
      user.twoFactor.email.isEnabled || user.twoFactor.webauthn.isEnabled
    const shouldUpdatePreferredMethod = user.twoFactor.preferredMethod === 'app'
    const newPreferredMethod = shouldUpdatePreferredMethod
      ? user.twoFactor.webauthn.isEnabled
        ? 'webauthn'
        : user.twoFactor.email.isEnabled
        ? 'email'
        : 'none'
      : user.twoFactor.preferredMethod

    // 5. Opération atomique
    const result = await User.updateOne(
      {
        _id: user._id,
        'twoFactor.app.isEnabled': true,
      },
      {
        $set: {
          'twoFactor.app.isEnabled': false,
          'twoFactor.isEnabled': otherMethodsEnabled,
          'twoFactor.preferredMethod': newPreferredMethod,
        },
        $unset: {
          'twoFactor.app.secret': 1,
          ...(!otherMethodsEnabled && { 'twoFactor.backupCodes': 1 }),
        },
      },
    )

    if (result.matchedCount === 0) {
      return ApiResponse.error(res, t('auth:errors.app.not_enabled'), 400)
    }

    return ApiResponse.success(
      res,
      {
        preferredMethod: newPreferredMethod,
        backupCodes: otherMethodsEnabled ? user.twoFactor.backupCodes : [],
      },
      t('auth:success.app.disabled'),
      200,
    )
  },
)

// Désactiver la 2FA par email
export const disableTwoFactorEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { method, value } = req.body

    // 1. Validation des entrées
    if (!method || !value) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    const user = req.user

    // 2. Vérifications initiales
    if (!user.twoFactor?.email?.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.email.not_enabled'), 400)
    }

    // 3. Vérification des credentials
    let isValid = false
    if (method === 'password') {
      isValid = await comparePassword(value, user.password)
    } else if (method === 'otp') {
      const { token, expiration } = user.twoFactor.email

      if (!token || !expiration) {
        return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
      }

      if (isCodeExpired(expiration)) {
        return ApiResponse.error(res, t('auth:errors.2fa.code_expired'), 400)
      }

      isValid = await compareEmailCode(token, value)
    } else {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
    }

    if (!isValid) {
      return ApiResponse.error(
        res,
        method === 'password'
          ? t('auth:errors.password_incorrect')
          : t('auth:errors.2fa.invalid_code'),
        400,
      )
    }

    // 4. Préparation des updates
    const otherMethodsEnabled =
      user.twoFactor.app.isEnabled || user.twoFactor.webauthn.isEnabled
    const shouldUpdatePreferredMethod =
      user.twoFactor.preferredMethod === 'email'
    const newPreferredMethod = shouldUpdatePreferredMethod
      ? user.twoFactor.app.isEnabled
        ? 'app'
        : user.twoFactor.webauthn.isEnabled
        ? 'webauthn'
        : 'none'
      : user.twoFactor.preferredMethod

    // 5. Opération atomique
    const result = await User.updateOne(
      {
        _id: user._id,
        'twoFactor.email.isEnabled': true,
      },
      {
        $set: {
          'twoFactor.email.isEnabled': false,
          'twoFactor.isEnabled': otherMethodsEnabled,
          'twoFactor.preferredMethod': newPreferredMethod,
        },
        $unset: {
          'twoFactor.email.token': 1,
          'twoFactor.email.expiration': 1,
          ...(!otherMethodsEnabled && { 'twoFactor.backupCodes': 1 }),
        },
      },
    )

    if (result.matchedCount === 0) {
      return ApiResponse.error(res, t('auth:errors.email.not_enabled'), 400)
    }

    return ApiResponse.success(
      res,
      {
        preferredMethod: newPreferredMethod,
        backupCodes: otherMethodsEnabled ? user.twoFactor.backupCodes : [],
      },
      t('auth:success.email.disabled'),
      200,
    )
  },
)

export const twoFactorLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email, rememberMe = false, method, value } = req.body

    // 1. Validation des entrées
    if (!email || !value || !method) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    // 2. Récupération utilisateur avec projection minimale
    const user = await User.findOne(
      { email },
      {
        email: 1,
        firstName: 1,
        lastName: 1,
        tokenVersion: 1,
        language: 1,
        role: 1,
        'twoFactor.isEnabled': 1,
        'twoFactor.app': 1,
        'twoFactor.email': 1,
        'twoFactor.backupCodes': 1,
      },
    ).lean()
    if (!assertUserExists(user, res, t)) {
      return
    }

    // 3. Vérification 2FA activée
    if (!user.twoFactor?.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.not_enabled'), 400)
    }

    // 4. Vérification du second facteur
    const verificationResult = await verifySecondFactor(user, method, value, t)
    if (!verificationResult.valid) {
      return ApiResponse.error(res, verificationResult.errorMessage, 400)
    }

    // 5.1 Mise à jour utilisateur (backup code si nécessaire)
    const updateOps = {
      $set: { lastLogin: new Date() },
      ...(method === 'backup_code' && {
        $set: { 'twoFactor.backupCodes.$[elem].used': true },
      }),
    }

    const updateOptions = {
      ...(method === 'backup_code' && {
        arrayFilters: [{ 'elem.code': value, 'elem.used': false }],
      }),
    }
    await User.updateOne({ _id: user._id }, updateOps, updateOptions)

    // 5.2 Création session et tokens
    const {
      accessToken,
      refreshToken,
      session: userSession,
    } = await SessionService.createSessionWithTokens(
      t,
      user,
      req,
      res,
      rememberMe,
    )

    const deviceInfo = getDeviceInfo(userSession.userAgent || '')

    await sendLoginEmail(
      t as TFunction,
      user,
      userSession.ip,
      deviceInfo,
      userSession.location as string,
    )

    return ApiResponse.success(
      res,
      { accessToken, refreshToken },
      t('auth:success.logged_in'),
      200,
    )
  },
)

export const disableTwoFactor = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { method, value } = req.body

    if (!method || !value) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    const user = req.user

    if (!user.twoFactor?.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.not_enabled'), 400)
    }

    let isValid = false
    if (method === 'password') {
      isValid = await comparePassword(value, user.password)
    } else if (method === 'email' && user.twoFactor?.email?.isEnabled) {
      const { token, expiration } = user.twoFactor.email

      if (!token || !expiration) {
        return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
      }

      if (isCodeExpired(expiration)) {
        return ApiResponse.error(res, t('auth:errors.2fa.code_expired'), 400)
      }

      isValid = await compareEmailCode(token, value)
    } else if (method === 'app' && user.twoFactor?.app?.isEnabled) {
      if (!user.twoFactor.app.secret) {
        return ApiResponse.error(res, t('common:errors.bad_request'), 400)
      }
      isValid = verifyTwoFactorCode(user.twoFactor.app.secret, value)
    } else if (method === 'webauthn' && user.twoFactor?.webauthn?.isEnabled) {
      const credentialId = value?.rawId || value?.id
      if (!credentialId) {
        return ApiResponse.error(
          res,
          t('auth:errors.webauthn.credential_not_found'),
          400,
        )
      }
      const dbCredential = findCredentialById(
        user.twoFactor.webauthn,
        credentialId,
      )
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
          expectedChallenge: user.twoFactor.webauthn.challenge || '',
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
        return ApiResponse.error(
          res,
          t('auth:errors.webauthn.authentication'),
          400,
        )
      }
      isValid = verification.verified
    } else if (method === 'backup_code') {
      isValid = verifyBackupCode(user, value)
    } else {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
    }

    if (!isValid) {
      const errorMessage = getErrorMessageForMethod(method, t)
      return ApiResponse.error(res, errorMessage, 400)
    }

    const result = await User.updateOne(
      {
        _id: user._id,
        'twoFactor.isEnabled': true, // Condition atomique
      },
      {
        $set: {
          'twoFactor.isEnabled': false,
          'twoFactor.preferredMethod': 'none',
        },
        $unset: {
          'twoFactor.email.isEnabled': 1,
          'twoFactor.email.token': 1,
          'twoFactor.email.expiration': 1,
          'twoFactor.app.isEnabled': 1,
          'twoFactor.app.secret': 1,
          'twoFactor.webauthn.isEnabled': 1,
          'twoFactor.webauthn.challenge': 1,
          'twoFactor.webauthn.expiration': 1,
          'twoFactor.webauthn.credentials': 1,
          'twoFactor.backupCodes': 1,
        },
      },
    )

    if (result.matchedCount === 0) {
      return ApiResponse.error(res, t('auth:errors.not_enabled'), 400)
    }

    return ApiResponse.success(
      res,
      { preferredMethod: 'none', backupCodes: [] },
      i18next.t('auth:success.2fa.disabled'),
      200,
    )
  },
)
