const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const ms = require('ms')
const UAParser = require('ua-parser-js')
// Controllers
const { verifyAuthentication } = require('./WebAuthnController')
// Helpers
const {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorCode,
  generateBackupCodes,
  verifyBackupCode,
  hashEmailCode,
  compareEmailCode,
} = require('../helpers/2FAHelpers')
const { generateCookie, findLocation } = require('../helpers/AuthHelpers')
// .env
require('dotenv').config()

// Obtenir le statut de la 2FA
const getStatus = async (req, res) => {
  const { t } = req
  try {
    // 1. Vérifier si l'utilisateur est authentifié
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        error: t('auth:errors.user_not_found'),
      })
    }
    // 2. Vérifier si la 2FA est activée
    if (
      !user.twoFactor.email.isEnabled &&
      !user.twoFactor.app.isEnabled &&
      !user.twoFactor.webauthn.isEnabled
    ) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.not_enabled'),
      })
    }

    // 3. Récupérer les informations de la 2FA
    const webauthnCredentials = user.twoFactor.webauthn.credentials.map(
      (cred) => ({
        id: cred.id,
        deviceName: cred.deviceName,
        deviceType: cred.deviceType,
        createdAt: cred.createdAt,
      }),
    )

    return res.status(200).json({
      success: true,
      twoFactor: {
        email: user.twoFactor.email.isEnabled,
        app: user.twoFactor.app.isEnabled,
        webauthn: user.twoFactor.webauthn.isEnabled,
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes,
        securityQuestions: user.twoFactor.securityQuestions,
        webauthnCredentials: webauthnCredentials,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de la 2FA:', error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.getstatus_error'),
    })
  }
}

// Activer la 2FA par application
const configTwoFactorApp = async (req, res) => {
  const { t } = req
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Si l'option est déjà activée, retourner une erreur
    if (user.twoFactor.app.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.app.already_enabled'),
      })
    }

    // 3. Générer un secret et un QR code pour la configuration de la 2FA
    const secret = generateTwoFactorSecret()
    const qrCode = await generateQRCode(secret)

    user.twoFactor.app.secret = secret.base32
    user.twoFactor.app.isEnabled = false

    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.app.setup_initiated'),
      data: {
        secret: secret.base32,
        qrCode: qrCode,
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'activation de la 2FA:", error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.app.configuration_error'),
    })
  }
}

// Activer la 2FA par email
const configTwoFactorEmail = async (req, res) => {
  const { t } = req
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si l'email est vérifié
    if (!user.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email_not_verified'),
      })
    }

    // 3. Si l'option est déjà activée, retourner une erreur
    if (user.twoFactor.email.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email.already_enabled'),
      })
    }

    // 4. Générer un code de vérification par email
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.twoFactor.email.token = await hashEmailCode(code)
    user.twoFactor.email.expiration = new Date(Date.now() + 10 * 60 * 1000)

    await user.save()
    // 5. Envoyer le code de vérification par email
    // TODO: Implémenter la fonction d'envoi d'email

    return res.status(200).json({
      success: true,
      message: t('auth:success.email.setup_initiated'),
    })
  } catch (error) {
    console.error("Erreur lors de l'activation de la 2FA par email:", error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.email.configuration_error'),
    })
  }
}

// Renvoyer le code de vérification par email
const resendEmailCode = async (req, res) => {
  const { t } = req
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si l'option est activée
    if (!user.twoFactor.email.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email.not_enabled'),
      })
    }

    // 3. Générer un code de vérification par email
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.twoFactor.email.token = await hashEmailCode(code)
    user.twoFactor.email.expiration = new Date(Date.now() + 10 * 60 * 1000)

    // 4. Envoyer le code de vérification par email
    // TODO: Implémenter la fonction d'envoi d'email

    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.email.code_resend'),
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.email.resend_error'),
    })
  }
}

// Vérifier et activer la 2FA
const EnableTwoFactorApp = async (req, res) => {
  const { t } = req
  const { token } = req.body

  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return res.status(400).json({
      success: false,
      error: t('auth:errors.2fa.invalid_code'),
    })
  }
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si la 2FA a été configurée
    if (!user.twoFactor.secret) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.app.not_enabled'),
      })
    }

    // 3. Vérifier si le code est correct
    const isValid = verifyTwoFactorCode(user.twoFactor.secret, token)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_code'),
      })
    }

    // 4. Activer la 2FA
    user.twoFactor.app.isEnabled = true

    // 5. Si l'app est la première méthode 2FA, on génère des codes de sauvegarde ou certains sont utilisés, on les remplace
    if (
      !user.twoFactor.backupCodes ||
      user.twoFactor.backupCodes.length === 0
    ) {
      user.twoFactor.backupCodes = generateBackupCodes(8)
    } else {
      const unusedCodes = user.twoFactor.backupCodes.filter(
        (code) => !code.used,
      )
      const codesToGenerate = 8 - unusedCodes.length

      if (codesToGenerate > 0) {
        const newCodes = generateBackupCodes(codesToGenerate)
        user.twoFactor.backupCodes = [...unusedCodes, ...newCodes]
      }
    }

    // 6. Si aucune méthode préférée n'est définie, on la définit sur 'app'
    if (!user.twoFactor.preferredMethod) {
      user.twoFactor.preferredMethod = 'app'
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.app.enabled'),
      data: {
        backupCodes: user.twoFactor.backupCodes,
        preferredMethod: user.twoFactor.preferredMethod,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA:', error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.app.enable_error'),
    })
  }
}

// Vérifier et activer la 2FA par email
const EnableTwoFactorEmail = async (req, res) => {
  const { t } = req
  const { code } = req.body

  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return res.status(400).json({
      success: false,
      error: t('auth:errors.2fa.invalid_code'),
    })
  }

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si la 2FA a été configurée
    if (!user.twoFactor.email.token || !user.twoFactor.email.expiration) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.setup_required'),
      })
    }

    // 3. Vérifier si le code n'a pas expiré
    if (new Date(user.twoFactor.email.expiration) < new Date()) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.code_expired'),
      })
    }

    // 4. Vérifier si le code est correct
    const isMatch = await compareEmailCode(user.twoFactor.email.token, code)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_code'),
      })
    }

    // 5. Si email est la première méthode 2FA, on génère des codes de sauvegarde ou certains sont utilisés, on les remplace

    if (
      !user.twoFactor.backupCodes ||
      user.twoFactor.backupCodes.length === 0
    ) {
      user.twoFactor.backupCodes = generateBackupCodes(8)
    } else {
      const unusedCodes = user.twoFactor.backupCodes.filter(
        (code) => !code.used,
      )
      const codesToGenerate = 8 - unusedCodes.length

      if (codesToGenerate > 0) {
        const newCodes = generateBackupCodes(codesToGenerate)
        user.twoFactor.backupCodes = [...unusedCodes, ...newCodes]
      }
    }

    if (!user.twoFactor.preferredMethod) {
      user.twoFactor.preferredMethod = 'email'
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.email.enabled'),
      data: {
        backupCodes: user.twoFactor.backupCodes,
        preferredMethod: user.twoFactor.preferredMethod,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA par email:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.verify_error')
  }
}

// Vérifier le code 2FA lors de la connexion
const verifyLoginTwoFactor = async (req, res) => {
  try {
    const { email, stayLoggedIn, token, method } = req.body

    // Validate required fields
    if (!email || !token || !method) {
      return sendLocalizedError(res, 400, 'errors.generic.missing_fields')
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    // Check if 2FA is locked
    if (user.twoFactor.lockUntil && user.twoFactor.lockUntil > Date.now()) {
      return sendLocalizedError(res, 403, 'errors.2fa.temporarily_locked')
    }

    // Verify based on chosen method
    let isValid = false
    switch (method) {
      case 'app':
        if (!user.twoFactor.app.isEnabled) {
          return sendLocalizedError(res, 400, 'errors.2fa.app_not_enabled')
        }
        isValid = verifyTwoFactorCode(user.twoFactor.app.secret, token)
        break
      case 'email':
        if (!user.twoFactor.email.isEnabled) {
          return sendLocalizedError(res, 400, 'errors.2fa.email_not_enabled')
        }
        const isMatch = await compareEmailCode(
          user.twoFactor.email.token,
          token,
        )
        isValid =
          isMatch && new Date(user.twoFactor.email.expiration) > new Date()
        break
      case 'webauthn':
        if (!user.twoFactor.webauthn.isEnabled) {
          return sendLocalizedError(res, 400, 'errors.2fa.webauthn_not_enabled')
        }
        try {
          const verification = await verifyAuthentication({
            responsekey: token,
            user,
            res,
          })
          isValid = verification.verified || false

          // Ajouter des informations sur l'appareil utilisé
          req.deviceType = verification.deviceType
        } catch (error) {
          isValid = false

          // Gestion des tentatives échouées
          user.twoFactor.attempts += 1
          if (user.twoFactor.attempts >= 5) {
            user.twoFactor.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
          }
          await user.save()
        }
        break
      default:
        return sendLocalizedError(res, 400, 'errors.2fa.invalid_method')
    }

    if (!isValid) {
      // Increment failed attempts
      user.twoFactor.attempts += 1
      if (user.twoFactor.attempts >= 5) {
        user.twoFactor.lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 min lock
      }
      await user.save()
      return sendLocalizedError(res, 400, 'errors.2fa.invalid_code')
    }

    // Reset attempts on success
    user.twoFactor.attempts = 0
    user.twoFactor.lockUntil = null

    user.twoFactor.lastVerified = new Date()
    user.lastLoginAt = Date.now()
    user.loginAttempts = 0
    user.lockUntil = null

    const userAgent = req.headers['user-agent'] || 'unknown'
    const ipAddress =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const sessionDuration = stayLoggedIn
      ? ms(process.env.SESSION_DURATION_LONG)
      : ms(process.env.SESSION_DURATION_SHORT)

    //vérification des sessions expirées
    user.activeSessions = user.activeSessions.filter(
      (session) => session.expiresAt > Date.now(),
    )

    await user.save()

    // pas plus de 5 sessions en mm temps
    if (user.activeSessions.length >= 5) {
      user.activeSessions.sort((a, b) => a.expiresAt - b.expiresAt)
      user.activeSessions.shift()
    }

    user.activeSessions.push({
      ipAddress,
      userAgent,
      fingerprint: generateSessionFingerprint(req),
      expiresAt: new Date(Date.now() + sessionDuration),
    })

    await user.save()

    GenerateAuthCookie(res, user, stayLoggedIn)
    const location = await findLocation(user, ipAddress)

    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const os = parser.getOS()
    const browser = parser.getBrowser()

    const deviceInfo =
      `${browser.name} ${browser.version} sur ${os.name} ${os.version}` +
      (device.model ? ` (${device.vendor || ''} ${device.model})` : '')

    await sendNewLoginEmail(user, ipAddress, deviceInfo, location)

    const userResponse = user.toMinimal()

    return sendLocalizedSuccess(
      res,
      'success.auth.successful_login',
      {},
      { user: userResponse, isVerified: user.isVerified },
    )
  } catch (error) {
    console.error('Erreur lors de la vérification de la 2FA:', error)
    return sendLocalizedError(res, 500, 'errors.2fa.login_error')
  }
}

// Définir la méthode préférée
const setPreferredMethod = async (req, res) => {
  const { t } = req
  try {
    const { method } = req.body

    // 1. Vérifier si la méthode est fournie
    if (!method) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_method'),
      })
    }

    // 2. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    if (!['app', 'email', 'webauthn'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_method'),
      })
    }

    // Vérifier que la méthode est activée
    if (method === 'email' && !user.twoFactor.email.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email.not_enabled'),
      })
    }
    if (method === 'webauthn' && !user.twoFactor.webauthn.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.not_enabled'),
      })
    }
    if (method === 'app' && !user.twoFactor.app.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.app.not_enabled'),
      })
    }

    user.twoFactor.preferredMethod = method
    await user.save()

    return res.status(200).json({
      success: true,
      data: {
        preferredMethod: user.twoFactor.preferredMethod,
      },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour de la méthode préférée:',
      error,
    )
    return res.status(500).json({
      success: false,
      error: t('auth:errors.2fa.update_preferred_method_error'),
    })
  }
}

// Désactiver la 2FA
const disableTwoFactorApp = async (req, res) => {
  const { t } = req
  const { token } = req.body
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return res.status(400).json({
      success: false,
      error: t('auth:errors.2fa.invalid_code'),
    })
  }
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si la 2FA est activée
    if (!user.twoFactor.app.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.app.not_enabled'),
      })
    }

    // 3. Vérifier si le code est correct
    const isValid = verifyTwoFactorCode(user.twoFactor.app.secret, token)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_code'),
      })
    }

    // 4. Désactiver la 2FA
    user.twoFactor.app.isEnabled = false
    user.twoFactor.app.secret = null

    // 5. Si l'app est la méthode préférée, on la change
    if (user.twoFactor.preferredMethod === 'app') {
      user.twoFactor.preferredMethod = user.twoFactor.webauthn.isEnabled
        ? 'webauthn'
        : user.twoFactor.email.isEnabled
        ? 'email'
        : undefined
    }

    // 6. Si aucune méthode n'est activée, on réinitialise les codes de sauvegarde
    if (!user.twoFactor.email.isEnabled && !user.twoFactor.webauthn.isEnabled) {
      user.twoFactor = {
        backupCodes: [],
        securityQuestions: [],
      }
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.app.disabled'),
      data: {
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la désactivation de la 2FA:', error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.app.disable_error'),
    })
  }
}

// Désactiver la 2FA par email
const disableTwoFactorEmail = async (req, res) => {
  const { t } = req
  const { password } = req.body
  if (!password) {
    return res.status(400).json({
      success: false,
      error: t('auth:errors.missing_fields'),
    })
  }
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si la 2FA est activée
    if (!user.twoFactor.email.isEnabled) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email.not_enabled'),
      })
    }

    // 3. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.password_incorrect'),
      })
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
        : undefined
    }

    // 6. Si aucune méthode n'est activée, on réinitialise les codes de sauvegarde
    if (!user.twoFactor.app.isEnabled && !user.twoFactor.webauthn.isEnabled) {
      user.twoFactor = {
        backupCodes: [],
        securityQuestions: [],
      }
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.email.disabled'),
      data: {
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la désactivation de la 2FA par email:', error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.email.disable_error'),
    })
  }
}

// Utiliser un code de secours
const useBackupCode = async (req, res) => {
  const { t } = req
  try {
    const { email, stayLoggedIn, backupCode } = req.body

    // 1. Vérifier que l'utilisateur existe
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier que la 2FA est activée
    if (
      !user.twoFactor.app.isEnabled &&
      !user.twoFactor.email.isEnabled &&
      !user.twoFactor.webauthn.isEnabled
    ) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.not_enabled'),
      })
    }

    // 3. Vérifier que le code de secours est correct
    const isValid = verifyBackupCode(user, backupCode)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_backup_code'),
      })
    }

    // 4. Marquer le code de secours comme utilisé
    const backupCodeIndex = user.twoFactor.backupCodes.findIndex(
      (code) => code.code === backupCode,
    )
    if (backupCodeIndex === -1) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.2fa.invalid_backup_code'),
      })
    }
    user.twoFactor.backupCodes[backupCodeIndex].used = true

    // 5. Créer une nouvelle session
    const userAgent = req.headers['user-agent'] || 'unknown'
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const location = await findLocation(user.language, ip)
    const sessionDuration = stayLoggedIn
      ? ms(process.env.SESSION_DURATION_LONG)
      : ms(process.env.SESSION_DURATION_SHORT)

    // Vérification des sessions expirées
    user.loginHistory = user.loginHistory.filter(
      (session) => session.expiresAt > Date.now(),
    )

    // Vérification de la limite de sessions
    if (user.loginHistory.length >= 5) {
      user.loginHistory.sort((a, b) => a.expiresAt - b.expiresAt)
      user.loginHistory.shift()
    }

    user.loginHistory.push({
      ip,
      userAgent,
      location,
      date: new Date(),
      expiresAt: new Date(Date.now() + sessionDuration),
    })

    await user.save()

    // Générer le cookie de session
    generateCookie(res, user, stayLoggedIn)

    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const os = parser.getOS()
    const browser = parser.getBrowser()

    const deviceInfo =
      `${browser.name} ${browser.version} sur ${os.name} ${os.version}` +
      (device.model ? ` (${device.vendor || ''} ${device.model})` : '')

    // TODO: Envoyer un email de notification de connexion avec les détails de l'appareil et la localisation

    return res.status(200).json({
      success: true,
      message: t('auth:success.2fa.backup_code_used'),
    })
  } catch (error) {
    console.error("Erreur lors de l'utilisation du code de secours:", error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.2fa.backup_code_error'),
    })
  }
}

module.exports = {
  getStatus,
  configTwoFactorApp,
  configTwoFactorEmail,
  resendEmailCode,
  EnableTwoFactorApp,
  EnableTwoFactorEmail,
  verifyLoginTwoFactor,
  disableTwoFactorApp,
  disableTwoFactorEmail,
  setPreferredMethod,
  useBackupCode,
}
