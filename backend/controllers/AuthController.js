const User = require('../models/User')
const {
  hashPassword,
  comparePassword,
  validateEmail,
  validateName,
  validatePassword,
  findLocation,
  generateCookie,
  generateVerificationCode,
  generateResetToken,
} = require('../helpers/AuthHelpers')

const i18n = require('../i18n')

const { sendResetPasswordEmail } = require('../utils/SendMail')

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
    // TODO: envoyer un email de vérification avec le token

    // 8. On crée l'utilisateur
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const location = await findLocation(t, i18n.language, ip)

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
          date: new Date(),
        },
      ],
    })

    // 9. On génère le cookie de session
    generateCookie(res, user, rememberMe)

    return res.status(201).json({
      success: true,
      message: t('auth:success.registered'),
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

    generateCookie(res, user, rememberMe)

    //5. Check if user is verified
    if (!user.emailVerified) {
      // TODO: send verification email
      return res.status(403).json({
        success: false,
        error: req.t('auth:errors.email_not_verified'),
      })
    }

    // 6. Update last login and login history
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const location = await findLocation(user.language, ip)
    const sessionDuration = rememberMe
      ? ms(process.env.SESSION_DURATION_LONG)
      : ms(process.env.SESSION_DURATION_SHORT)

    user.lastLogin = new Date()
    user.loginHistory.push({
      ip,
      userAgent,
      location,
      date: new Date(),
      expiresAt: new Date(Date.now() + sessionDuration),
    })
    await user.save()

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
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        lastName: req.user.lastName,
        firstName: req.user.firstName,
        language: req.user.language,
        theme: req.user.theme,
        role: req.user.role,
      },
    })
  } catch (err) {
    const { t } = req
    console.error('Session check error:', err)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const { t } = req

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

    // 3. On génère un token de réinitialisation
    const resetToken = generateResetToken()
    const expiration = new Date(Date.now() + 60 * 60 * 1000) // 1h
    user.resetPassword = { token: resetToken, expiration }
    const link = `${
      process.env.FRONTEND_SERVER
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    await user.save()

    // 4. On envoie un email avec le token
    await sendResetPasswordEmail(user.email, link, user.language)

    return res.status(200).json({
      success: true,
      message: t('auth:success.reset_email_sent'),
    })
  } catch (err) {
    const { t } = req
    console.error('Forgot password error:', err)
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
  try {
    const { token } = req.body
    const { t } = req
    const user = req.user

    // 1. Validation du code
    if (!token) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_fields'),
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
    if (
      !user ||
      !user.emailVerification ||
      user.emailVerification.token !== token
    ) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.invalid_token') })
    }
    if (user.emailVerification.expiration < new Date()) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.token_expired') })
    }

    // 5. Mise à jour de l'utilisateur
    user.emailVerification.isVerified = true
    user.emailVerification.token = undefined
    user.emailVerification.expiration = undefined
    await user.save()

    // 6. Envoyer un email de bienvenue
    // TODO: envoyer un email de bienvenue

    return res
      .status(200)
      .json({ success: true, message: t('auth:success.email_verified') })
  } catch (err) {
    const { t } = req
    console.error('Verify email error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const { t } = req
    const user = req.user

    // 1. Validation des champs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_fields'),
      })
    }

    // 2. Vérification de l'ancien mot de passe
    const isMatch = await comparePassword(oldPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: t('auth:errors.invalid_password'),
      })
    }

    // 3. Vérification du nouveau mot de passe
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_password'),
      })
    }

    // 4. Mise à jour du mot de passe
    user.password = await hashPassword(newPassword)
    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.password_changed'),
    })
  } catch (err) {
    const { t } = req
    console.error('Change password error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

// TODO: Change email : si la double authentication est activée, on demande à l'utilisateur s'il veut continuer.

module.exports = {
  register,
  checkAuthStatus,
  login,
  logout,
  checkSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
}
