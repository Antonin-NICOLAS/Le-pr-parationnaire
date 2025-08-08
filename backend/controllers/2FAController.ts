import User from '../models/User.js'
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
} from '../helpers/2FAHelpers.js'
import {
  generateCookie,
  comparePassword,
  findLocation,
  getDeviceInfo,
} from '../helpers/AuthHelpers.js'
// Emails
import {
  sendTwoFactorEmailActivation,
  sendLoginEmail,
} from '../emails/SendMail.js'
// .env
import dotenv from 'dotenv'
dotenv.config()

// Obtenir le statut de la 2FA
export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const { t } = req
  const user = req.user

  return ApiResponse.success(res, {
    email: { isEnabled: user.twoFactor.email.isEnabled || false },
    app: { isEnabled: user.twoFactor.app.isEnabled || false },
    webauthn: { isEnabled: user.twoFactor.webauthn.isEnabled || false },
    preferredMethod: user.twoFactor.preferredMethod || 'none',
    backupCodes: user.twoFactor.backupCodes || [],
    credentials: user.twoFactor.webauthn.credentials || [],
  })
})

// Activer la 2FA par application
export const configTwoFactorApp = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Si l'option est déjà activée, retourner une erreur
    if (user.twoFactor.app.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.app.already_enabled'), 400)
    }

    // 3. Générer un secret et un QR code pour la configuration de la 2FA
    const secret = generateTwoFactorSecret()
    const qrCode = await generateQRCode(secret)

    user.twoFactor.app!.secret = secret.base32
    user.twoFactor.app!.isEnabled = false

    await user.save()

    return ApiResponse.success(
      res,
      {
        secret: secret.base32,
        qrCode: qrCode,
      },
      t('auth:success.app.setup_initiated'),
      200,
    )
  },
)

// Activer la 2FA par email
export const configTwoFactorEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si l'email est vérifié
    if (!user.emailVerification.isVerified) {
      return ApiResponse.error(res, t('auth:errors.email_not_verified'), 400)
    }

    // 3. Si l'option est déjà activée, retourner une erreur
    if (user.twoFactor.email.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.email.already_enabled'), 400)
    }

    // 4. Générer un code de vérification par email
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.twoFactor.email.token = await hashEmailCode(code)
    user.twoFactor.email.expiration = new Date(Date.now() + 10 * 60 * 1000)

    await user.save()
    // 5. Envoyer le code de vérification par email
    await sendTwoFactorEmailActivation(
      t as TFunction,
      user,
      code,
      new Date(user.twoFactor.email.expiration).toLocaleString(
        i18next.language,
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
    )

    return ApiResponse.success(
      res,
      {},
      t('auth:success.email.setup_initiated'),
      200,
    )
  },
)

// Renvoyer le code de vérification par email (pour configuration mais aussi pour authentification)
export const resendEmailCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si l'option est activée
    if (!user.twoFactor.email.token || !user.twoFactor.email.expiration) {
      return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
    }

    // 3. Générer un code de vérification par email
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.twoFactor.email.token = await hashEmailCode(code)
    user.twoFactor.email.expiration = new Date(Date.now() + 10 * 60 * 1000)

    // 4. Envoyer le code de vérification par email
    await sendTwoFactorEmailActivation(
      t as TFunction,
      user,
      code,
      new Date(user.twoFactor.email.expiration).toLocaleString(
        i18next.language,
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
    )

    await user.save()

    return ApiResponse.success(
      res,
      {},
      t('auth:success.email.code_resend'),
      200,
    )
  },
)

// Vérifier et activer la 2FA
export const enableTwoFactorApp = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { token } = req.body

    console.log('Secret!', token)
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si la 2FA a été configurée
    if (!user.twoFactor.app.secret) {
      return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
    }

    console.log('Secret:', user.twoFactor.app.secret)
    // 3. Vérifier si le code est correct
    const isValid = verifyTwoFactorCode(user.twoFactor.app.secret, token)
    if (!isValid) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }

    // 4. Activer la 2FA
    user.twoFactor.app.isEnabled = true

    // 5. Si l'app est la première méthode 2FA, on génère des codes de sauvegarde ou certains sont utilisés, on les remplace
    rotateBackupCodes(user)

    // 6. Si aucune méthode préférée n'est définie, on la définit sur 'app'
    if (user.twoFactor.preferredMethod === 'none') {
      user.twoFactor.preferredMethod = 'app'
    }

    await user.save()

    return ApiResponse.success(
      res,
      {
        backupCodes: user.twoFactor.backupCodes,
        preferredMethod: user.twoFactor.preferredMethod,
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

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si la 2FA a été configurée
    if (!user.twoFactor.email.token || !user.twoFactor.email.expiration) {
      return ApiResponse.error(res, t('auth:errors.2fa.setup_required'), 400)
    }

    // 3. Vérifier si le code n'a pas expiré
    if (user.twoFactor.email.expiration < new Date()) {
      return ApiResponse.error(res, t('auth:errors.2fa.code_expired'), 400)
    }

    // 4. Vérifier si le code est correct
    const isMatch = await compareEmailCode(user.twoFactor.email.token, code)
    if (!isMatch) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }

    // 5. Si email est la première méthode 2FA, on génère des codes de sauvegarde ou certains sont utilisés, on les remplace
    user.twoFactor.email.isEnabled = true

    rotateBackupCodes(user)

    if (user.twoFactor.preferredMethod === 'none') {
      user.twoFactor.preferredMethod = 'email'
    }

    await user.save()

    return ApiResponse.success(
      res,
      {
        backupCodes: user.twoFactor.backupCodes,
        preferredMethod: user.twoFactor.preferredMethod,
      },
      t('auth:success.email.enabled'),
      200,
    )
  },
)

// Définir la méthode préférée
export const setPreferredMethod = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { method } = req.body

    // 1. Vérifier si la méthode est fournie
    if (!method) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
    }

    // 2. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    if (!['app', 'email', 'webauthn'].includes(method)) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_method'), 400)
    }

    // Vérifier que la méthode est activée
    if (method === 'email' && !user.twoFactor.email.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.email.not_enabled'), 400)
    }
    if (method === 'webauthn' && !user.twoFactor.webauthn.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.webauthn.not_enabled'), 400)
    }
    if (method === 'app' && !user.twoFactor.app.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.app.not_enabled'), 400)
    }

    user.twoFactor.preferredMethod = method
    await user.save()

    return ApiResponse.success(res, {
      preferredMethod: user.twoFactor.preferredMethod,
    })
  },
)

// Désactiver la 2FA
export const disableTwoFactorApp = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { token } = req.body
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si la 2FA est activée
    if (!user.twoFactor.app.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.app.not_enabled'), 400)
    }

    // 3. Vérifier si le code est correct
    const isValid = verifyTwoFactorCode(user.twoFactor.app.secret!, token)
    if (!isValid) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }

    // 4. Désactiver la 2FA
    user.twoFactor.app.isEnabled = false
    user.twoFactor.app.secret = undefined

    // 5. Si l'app est la méthode préférée, on la change
    if (user.twoFactor.preferredMethod === 'app') {
      user.twoFactor.preferredMethod = user.twoFactor.webauthn.isEnabled
        ? 'webauthn'
        : user.twoFactor.email.isEnabled
        ? 'email'
        : 'none'
    }

    // 6. Si aucune méthode n'est activée, on réinitialise les codes de sauvegarde
    if (!user.twoFactor.email.isEnabled && !user.twoFactor.webauthn.isEnabled) {
      user.twoFactor.backupCodes = []
      user.twoFactor.preferredMethod = 'none'
    }

    await user.save()

    return ApiResponse.success(
      res,
      {
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes,
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
    if (!method || !value) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier si la 2FA est activée
    if (!user.twoFactor.email.isEnabled) {
      return ApiResponse.error(res, t('auth:errors.email.not_enabled'), 400)
    }

    // 3. Vérifier le mot de passe ou le code de vérification
    let isValid = false
    if (method === 'password') {
      isValid = await comparePassword(value, user.password)
    } else if (method === 'otp' && user.twoFactor.app.isEnabled) {
      isValid = verifyTwoFactorCode(user.twoFactor.app.secret!, value)
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

    // 4. Désactiver la 2FA par email
    user.twoFactor.email.isEnabled = false
    user.twoFactor.email.token = undefined
    user.twoFactor.email.expiration = undefined

    // 5. Si l'email est la méthode préférée, on la change
    if (user.twoFactor.preferredMethod === 'email') {
      user.twoFactor.preferredMethod = user.twoFactor.app.isEnabled
        ? 'app'
        : user.twoFactor.webauthn.isEnabled
        ? 'webauthn'
        : 'none'
    }

    // 6. Si aucune méthode n'est activée, on réinitialise les codes de sauvegarde
    if (!user.twoFactor.app.isEnabled && !user.twoFactor.webauthn.isEnabled) {
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
      t('auth:success.email.disabled'),
      200,
    )
  },
)

// Utiliser un code de secours
export const useBackupCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email, rememberMe, backupCode } = req.body

    if (!email || !backupCode) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    // 1. Vérifier que l'utilisateur existe
    const user = await User.findOne({ email })
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 2. Vérifier que la 2FA est activée
    if (
      !user.twoFactor.app.isEnabled &&
      !user.twoFactor.email.isEnabled &&
      !user.twoFactor.webauthn.isEnabled
    ) {
      return ApiResponse.error(res, t('auth:errors.not_enabled'), 400)
    }

    // 3. Vérifier que le code de secours est correct
    const isValid = verifyBackupCode(user, backupCode)
    if (!isValid) {
      return ApiResponse.error(
        res,
        t('auth:errors.2fa.invalid_backup_code'),
        400,
      )
    }

    // 4. Marquer le code de secours comme utilisé
    const backupCodeIndex = user.twoFactor.backupCodes.findIndex(
      (code) => code.code === backupCode,
    )
    if (backupCodeIndex === -1) {
      return ApiResponse.error(
        res,
        t('auth:errors.2fa.invalid_backup_code'),
        400,
      )
    }
    user.twoFactor.backupCodes[backupCodeIndex].used = true

    // 5. Créer une nouvelle session
    const session = await SessionService.createOrUpdateSession(
      user,
      req,
      rememberMe,
    )
    user.lastLogin = new Date()

    await user.save()

    // Générer le cookie de session
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

    return ApiResponse.success(
      res,
      {},
      t('auth:success.2fa.backup_code_used'),
      200,
    )
  },
)
