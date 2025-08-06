const User = require('../models/User')
const {
  hashPassword,
  comparePassword,
  validateEmail,
  validateName,
  validatePassword,
  getDeviceInfo,
  findLocation,
  detectSimilarDevice,
  generateCookie,
  generateVerificationCode,
  generateResetToken,
} = require('../helpers/AuthHelpers')
const ms = require('ms')
const { v4: uuidv4 } = require('uuid')
const UAParser = require('ua-parser-js')

const i18n = require('../i18n')

const {
  sendVerificationEmail,
  sendLoginEmail,
  sendResetPasswordEmail,
} = require('../emails/SendMail')

const register = async (req, res) => {
  try {
    const { email, password, lastName, firstName, rememberMe } = req.body
    const { t } = req

    // 1. Vérifier que tous les champs sont présents
    if (!email || !password || !lastName || !firstName) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_fields'),
      })
    }

    // 2. Vérification du nom et prénom
    if (!validateName(lastName)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_name'),
      })
    }

    if (!validateName(firstName)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_name'),
      })
    }

    // 3. On vérifie l'email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_email'),
      })
    }

    // 4. L'email est valide, on cherche si il est deja utilisé
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: t('auth:errors.email_exists'),
      })
    }

    // 5. On vérifie le mot de passe
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_password'),
      })
    }

    // 6. Mot de passe valide, on le crypte
    const hashedPassword = await hashPassword(password)

    // 7. On vérifie l'email de l'utilisateur
    const emailToken = generateVerificationCode()
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // 8. On crée l'utilisateur
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const location = await findLocation(t, i18n.language, ip)
    const duration = rememberMe
      ? ms(process.env.SESSION_DURATION_LONG)
      : ms(process.env.SESSION_DURATION_SHORT)

    const user = await User.create({
      lastName,
      firstName,
      email,
      password: hashedPassword,
      emailVerification: {
        token: emailToken,
        expiration,
      },
      lastLogin: new Date(),
      loginHistory: [
        {
          ip,
          userAgent,
          location,
          lastActive: new Date(),
          expiresAt: new Date(Date.now() + duration),
        },
      ],
    })

    await sendVerificationEmail(t, user, emailToken)

    return res.status(201).json({
      success: true,
      message: t('auth:success.registered'),
      requiresVerification: true,
      email: user.email,
      rememberMe: rememberMe,
    })
  } catch (err) {
    const { t } = req
    console.error('Registration error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const checkAuthStatus = async (req, res) => {
  try {
    const { email } = req.query

    // Check if user is authenticated
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(200).json({
        success: false,
        webauthn: false,
      })
    }

    return res.status(200).json({
      success: true,
      webauthn: user.twoFactor.webauthn.isEnabled,
    })
  } catch (err) {
    const { t } = req
    console.error('Auth status check error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body
    const { t } = req

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_credentials'),
      })
    }

    // 2. Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_email'),
      })
    }

    // 3. Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: t('auth:errors.invalid_credentials'),
      })
    }

    // 4. Compare password
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: t('auth:errors.invalid_credentials'),
      })
    }

    //5. Check if user is verified
    if (!user.emailVerification.isVerified) {
      if (
        !user.emailVerification.token ||
        user.emailVerification.expiration < new Date()
      ) {
        user.emailVerification.token = generateVerificationCode()
        user.emailVerification.expiration = new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        )
        await user.save()
      }
      sendVerificationEmail(t, user, user.emailVerification.token)
      return res.status(403).json({
        success: false,
        error: req.t('auth:errors.email_not_verified'),
        requiresVerification: true,
        email: user.email,
        rememberMe: rememberMe,
      })
    }

    // 6. Update last login and login history
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const deviceInfo = getDeviceInfo(userAgent)
    const location = await findLocation(t, user.language, ip)
    const sessionDuration = rememberMe
      ? ms(process.env.SESSION_DURATION_LONG)
      : ms(process.env.SESSION_DURATION_SHORT)

    // Analyse de l'userAgent
    const parser = new UAParser(userAgent)
    const uaResult = parser.getResult()

    // Vérifier si une session similaire existe déjà
    const existingSession = user.loginHistory.find((session) => {
      if (
        req.cookies?.sessionId &&
        session.sessionId === req.cookies.sessionId
      ) {
        return true
      }

      return (
        session.expiresAt > new Date() &&
        detectSimilarDevice(session.userAgent, userAgent) &&
        session.ip === ip
      )
    })

    let sessionId
    if (existingSession) {
      // Mise à jour de la session existante
      existingSession.lastActive = new Date()
      existingSession.expiresAt = new Date(Date.now() + sessionDuration)
      sessionId = existingSession.sessionId
    } else {
      // Création d'une nouvelle session
      sessionId = uuidv4()
      user.loginHistory.push({
        sessionId,
        ip,
        userAgent,
        location,
        deviceType: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || 'unknown',
        os: uaResult.os.name || 'unknown',
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + sessionDuration),
      })
    }

    // Nettoyage des sessions expirées
    user.loginHistory = user.loginHistory.filter(
      (session) => session.expiresAt > new Date(),
    )

    user.lastLogin = new Date()
    await user.save()

    // Génération des cookies avec le sessionId
    generateCookie(res, user, rememberMe, sessionId)

    // 7. Send login email notification
    await sendLoginEmail(t, user, ip, deviceInfo, location)

    return res.status(200).json({
      success: true,
      message: t('auth:success.logged_in'),
    })
  } catch (err) {
    const { t } = req
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const logout = (req, res) => {
  const { t } = req
  res.clearCookie('jwtauth')
  return res.status(200).json({
    success: true,
    message: t('auth:success.logged_out'),
  })
}

const checkSession = async (req, res) => {
  const { t } = req
  const user = req.user
  try {
    if (!user.emailVerification.isVerified) {
      return res.status(403).json({
        success: false,
        error: t('auth:errors.email_not_verified'),
        requiresVerification: true,
        email: user.email,
        rememberMe: false,
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        language: user.language,
        theme: user.theme,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Session check error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const forgotPassword = async (req, res) => {
  const { t } = req
  try {
    const { email } = req.body

    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.invalid_email') })
    }

    // 2. Même si l'email n'existe pas, on ne dit rien pour la sécurité
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(200).json({
        success: true,
        message: t('auth:success.reset_email_sent'),
      })
    }

    // 3. Si l'email n'est pas vérifié, on ne peut pas envoyer de lien de réinitialisation
    if (!user.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email_not_verified'),
        requiresVerification: true,
        email: user.email,
        rememberMe: false,
      })
    }

    // 4. On génère un token de réinitialisation
    const resetToken = generateResetToken()
    const expiration = new Date(Date.now() + 60 * 60 * 1000) // 1h
    user.resetPassword = { token: resetToken, expiration }
    const link = `${
      process.env.FRONTEND_SERVER
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    await user.save()

    // 5. On envoie un email avec le token
    await sendResetPasswordEmail(t, user, link)

    return res.status(200).json({
      success: true,
      message: t('auth:success.reset_email_sent'),
    })
  } catch (err) {
    console.error('Forgot password error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

const resendForgotPassword = async (req, res) => {
  const { t } = req
  try {
    const { email } = req.body
    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.invalid_email') })
    }
    // 2. On cherche l'utilisateur
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 3. Si l'email n'est pas vérifié, on ne peut pas envoyer de lien de réinitialisation
    if (!user.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email_not_verified'),
        requiresVerification: true,
        email: user.email,
        rememberMe: false,
      })
    }

    // 4. Nouveau token de réinitialisation si expiré ou inexistant sinon on garde l'ancien
    if (
      !user.resetPassword.token ||
      user.resetPassword.expiration < new Date()
    ) {
      user.resetPassword.token = generateResetToken()
      user.resetPassword.expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await user.save()
    }
    const link = `${process.env.FRONTEND_SERVER}/reset-password?token=${
      user.resetPassword.token
    }&email=${encodeURIComponent(email)}`

    // 5. On envoie un email avec le token
    await sendResetPasswordEmail(t, user, link)

    return res.status(200).json({
      success: true,
      message: t('auth:success.reset_email_sent'),
    })
  } catch (err) {
    console.error('Resend forgot password error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body
    const { t } = req

    // 1. Validation des champs
    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_fields'),
      })
    }
    // 2. Vérification de l'email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_email'),
      })
    }
    // 3. Vérification du mot de passe
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_password'),
      })
    }

    // 4. On cherche l'utilisateur
    const user = await User.findOne({ email })

    // 5. Vérification du token
    if (!user || !user.resetPassword || user.resetPassword.token !== token) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.invalid_token') })
    }
    if (user.resetPassword.expiration < new Date()) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.token_expired') })
    }

    // 6. On met à jour le mot de passe
    user.password = await hashPassword(newPassword)
    user.resetPassword = undefined
    await user.save()

    // 7. On envoie un mail de confirmation
    // TODO: envoyer un email de confirmation

    return res
      .status(200)
      .json({ success: true, message: t('auth:success.password_reset') })
  } catch (err) {
    const { t } = req
    console.error('Reset password error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

const verifyEmail = async (req, res) => {
  const { token, email, rememberMe } = req.body
  const { t } = req

  // 1. Validation des champs
  if (!token || !email) {
    return res.status(400).json({
      success: false,
      error: t('auth:errors.missing_fields'),
    })
  }
  try {
    // 2. On vérifie si l'utilisateur existe
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 3. Vérification si l'email est déjà vérifié
    if (user.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        error: t('auth.errors.email_already_verified'),
      })
    }

    // 4. Vérification du token
    if (user.emailVerification.token !== token) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.2fa.invalid_code') })
    }
    if (user.emailVerification.expiration < new Date()) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.code_expired') })
    }

    // 5. Mise à jour de l'utilisateur
    user.emailVerification.isVerified = true
    user.emailVerification.token = undefined
    user.emailVerification.expiration = undefined
    await user.save()

    // 6. On génère le cookie de session
    generateCookie(res, user, rememberMe)

    // 7. Envoyer un email de bienvenue
    // TODO: envoyer un email de bienvenue

    return res
      .status(200)
      .json({ success: true, message: t('auth:success.email_verified') })
  } catch (err) {
    console.error('Verify email error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

const resendVerificationEmail = async (req, res) => {
  const { t } = req
  try {
    const { email } = req.body

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_email'),
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    if (user.emailVerification.isVerified) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email_already_verified'),
      })
    }

    // Générer un nouveau token si l'ancien a expiré
    if (
      !user.emailVerification.token ||
      user.emailVerification.expiration < new Date()
    ) {
      user.emailVerification.token = generateVerificationCode()
      user.emailVerification.expiration = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      )
      await user.save()
    }

    await sendVerificationEmail(t, user, user.emailVerification.token)

    return res.status(200).json({
      success: true,
      message: t('auth:success.verification_email_resent'),
    })
  } catch (err) {
    console.error('Resend verification email error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const getActiveSessions = async (req, res) => {
  const { t } = req
  try {
    const user = req.user
    const currentSessionId = req.cookies?.sessionId

    if (!user) {
      return res.status(401).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    const sessions = user.loginHistory
      .filter((session) => session.expiresAt > new Date())
      .map((session) => {
        let deviceInfo = 'Unknown Device'
        if (session.browser && session.os) {
          deviceInfo = `${session.browser} on ${session.os}`
        } else if (session.userAgent) {
          deviceInfo = session.userAgent
        }

        return {
          sessionId: session.sessionId,
          ip: session.ip,
          location: session.location,
          device: deviceInfo,
          deviceType: session.deviceType,
          browser: session.browser,
          os: session.os,
          lastActive: session.lastActive,
          isCurrent: session.sessionId === currentSessionId,
        }
      })

    return res.status(200).json({
      success: true,
      sessions,
    })
  } catch (err) {
    console.error('Get active sessions error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const revokeSession = async (req, res) => {
  const { t } = req
  try {
    const { sessionId } = req.params
    const user = req.user

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_fields'),
      })
    }

    const session = user.loginHistory.find((s) => s.sessionId === sessionId)
    if (!session) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.session_not_found'),
      })
    }

    // On ne peut pas révoquer la session courante
    if (session.sessionId === req.cookies?.sessionId) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.cannot_revoke_current_session'),
      })
    }
    // Supprimer la session
    user.loginHistory = user.loginHistory.filter(
      (s) => s.sessionId !== sessionId,
    )
    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.session_revoked'),
    })
  } catch (err) {
    console.error('Revoke session error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const revokeAllSessions = async (req, res) => {
  const { t } = req
  try {
    const user = User.findById(req.user._id)

    // Supprimer toutes les sessions
    user.loginHistory = []
    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.all_sessions_revoked'),
    })
  } catch (err) {
    console.error('Revoke all sessions error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

module.exports = {
  register,
  checkAuthStatus,
  login,
  logout,
  checkSession,
  forgotPassword,
  resendForgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
}
