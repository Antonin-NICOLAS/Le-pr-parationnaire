import User from '../models/User'
import type { LoginHistory } from '../models/User'
import { asyncHandler } from '../helpers/AsyncHandler'
import { ApiResponse } from '../helpers/ApiResponse'
import { SessionService } from '../services/SessionService'
import ms, { StringValue } from 'ms'
import { Request, Response } from 'express'
import i18next, { TFunction } from 'i18next'
// Helpers
import {
  handleUnverifiedUser,
  hashPassword,
  comparePassword,
  validateEmail,
  validateName,
  validatePassword,
  getDeviceInfo,
  findLocation,
  generateCookie,
  generateVerificationCode,
  generateResetToken,
} from '../helpers/AuthHelpers.js'
// Emails
import {
  sendVerificationEmail,
  sendLoginEmail,
  sendResetPasswordEmail,
} from '../emails/SendMail.js'

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, lastName, firstName, rememberMe } = req.body
  const { t } = req

  // 1. Vérifier que tous les champs sont présents
  if (!email || !password || !lastName || !firstName) {
    return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
  }

  // 2. Vérification du nom et prénom
  if (!validateName(lastName)) {
    return ApiResponse.error(res, t('auth:errors.invalid_name'), 400)
  }

  if (!validateName(firstName)) {
    return ApiResponse.error(res, t('auth:errors.invalid_name'), 400)
  }

  // 3. On vérifie l'email
  if (!validateEmail(email)) {
    return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
  }

  // 4. L'email est valide, on cherche si il est deja utilisé
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return ApiResponse.error(res, t('auth:errors.email_exists'), 409)
  }

  // 5. On vérifie le mot de passe
  if (!validatePassword(password)) {
    return ApiResponse.error(res, t('auth:errors.invalid_password'), 400)
  }

  // 6. Mot de passe valide, on le crypte
  const hashedPassword = await hashPassword(password)

  // 7. On vérifie l'email de l'utilisateur
  const emailToken = generateVerificationCode()
  const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // 8. On crée l'utilisateur
  const ip =
    req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const userAgent = req.headers['user-agent'] || 'unknown'
  const location = await findLocation(t, i18next.language, ip as string)
  const duration = rememberMe
    ? ms(process.env.SESSION_DURATION_LONG as StringValue)
    : ms(process.env.SESSION_DURATION_SHORT as StringValue)

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
    language: i18next.language,
  })

  await sendVerificationEmail(t as TFunction, user, emailToken)

  return ApiResponse.success(
    res,
    {
      success: true,
      requiresVerification: true,
      email: user.email,
      rememberMe: rememberMe,
    },
    t('auth:success.registered'),
    200,
  )
})

export const checkAuthStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query

    // Check if user is authenticated
    const user = await User.findOne({ email })
    if (!user) {
      return ApiResponse.error(res, '', 404, {
        success: false,
        webauthn: false,
      })
    }

    return ApiResponse.success(res, {
      webauthn: user.twoFactor.webauthn.isEnabled,
    })
  },
)

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body
  const { t } = req

  // 1. Check if email and password are provided
  if (!email || !password) {
    return ApiResponse.error(res, t('auth:errors.missing_credentials'), 400)
  }

  // 2. Validate email format
  if (!validateEmail(email)) {
    return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
  }

  // 3. Check if user exists and password matches
  const user = await User.findOne({ email })
  const isMatch = user && (await comparePassword(password, user.password))
  if (!user || !isMatch) {
    return ApiResponse.error(res, t('auth:errors.invalid_credentials'), 404)
  }

  //5. Check if user is verified
  if (!user.emailVerification.isVerified) {
    await handleUnverifiedUser(user)
    await sendVerificationEmail(
      t as TFunction,
      user,
      user.emailVerification.token!,
    )
    return ApiResponse.error(res, t('auth:errors.email_not_verified'), 403, {
      requiresVerification: true,
      email: user.email,
      rememberMe: rememberMe,
    })
  }

  // 6. Update last login and login history
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
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { t } = req
  const sessionId = req.cookies?.sessionId
  const user = req.user

  // Clear cookies
  res.clearCookie('jwtauth', {
    path: '/',
    domain:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_SERVER
        : undefined,
  })
  res.clearCookie('sessionId', {
    path: '/',
    domain:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_SERVER
        : undefined,
  })

  // Remove current session from user's login history if exists
  if (user && sessionId) {
    SessionService.revokeSession(user, sessionId)
  }
  await user.save()

  return ApiResponse.success(res, {}, t('auth:success.logged_out'), 200)
})

export const checkSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user
    if (!user.emailVerification.isVerified) {
      return ApiResponse.error(res, t('auth:errors.email_not_verified'), 403, {
        requiresVerification: true,
        email: user.email,
        rememberMe: false,
      })
    }

    return ApiResponse.success(res, {
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
  },
)

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email } = req.body

    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }

    // 2. Même si l'email n'existe pas, on ne dit rien pour la sécurité
    const user = await User.findOne({ email })
    if (!user) {
      return ApiResponse.success(
        res,
        {},
        t('auth:success.reset_email_sent'),
        200,
      )
    }

    // 3. Si l'email n'est pas vérifié, on ne peut pas envoyer de lien de réinitialisation
    if (!user.emailVerification.isVerified) {
      return ApiResponse.error(res, t('auth:errors.email_not_verified'), 400, {
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
    await sendResetPasswordEmail(t as TFunction, user, link)

    return ApiResponse.success(res, {}, t('auth:success.reset_email_sent'), 200)
  },
)

export const resendForgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email } = req.body
    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }
    // 2. On cherche l'utilisateur
    const user = await User.findOne({ email })
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 3. Si l'email n'est pas vérifié, on ne peut pas envoyer de lien de réinitialisation
    if (!user.emailVerification.isVerified) {
      return ApiResponse.error(res, t('auth:errors.email_not_verified'), 400, {
        requiresVerification: true,
        email: user.email,
        rememberMe: false,
      })
    }

    // 4. Nouveau token de réinitialisation si expiré ou inexistant sinon on garde l'ancien
    if (
      !user.resetPassword.token ||
      !user.resetPassword.expiration ||
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
    await sendResetPasswordEmail(t as TFunction, user, link)

    return ApiResponse.success(res, {}, t('auth:success.reset_email_sent'), 200)
  },
)

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, token, newPassword } = req.body
    const { t } = req

    // 1. Validation des champs
    if (!email || !token || !newPassword) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }
    // 2. Vérification de l'email
    if (!validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }
    // 3. Vérification du mot de passe
    if (!validatePassword(newPassword)) {
      return ApiResponse.error(res, t('auth:errors.invalid_password'), 400)
    }

    // 4. On cherche l'utilisateur
    const user = await User.findOne({ email })

    // 5. Vérification du token
    if (!user || !user.resetPassword || user.resetPassword.token !== token) {
      return ApiResponse.error(res, t('auth:errors.invalid_token'), 400)
    }
    if (
      user.resetPassword.expiration &&
      user.resetPassword.expiration < new Date()
    ) {
      return ApiResponse.error(res, t('auth:errors.token_expired'), 400)
    }
    // 6. Vérification si le mot de passe est similaire à l'ancien
    const isSimilar = await comparePassword(newPassword, user.password)
    if (isSimilar) {
      return ApiResponse.error(res, t('auth:errors.similar_password'), 400)
    }

    // 7. On met à jour le mot de passe
    user.password = await hashPassword(newPassword)
    user.resetPassword.token = undefined
    user.resetPassword.expiration = undefined
    await user.save()

    // 8. On envoie un mail de confirmation
    // TODO: envoyer un email de confirmation

    return ApiResponse.success(res, {}, t('auth:success.password_reset'), 200)
  },
)

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token, email, rememberMe } = req.body
  const { t } = req

  // 1. Validation des champs
  if (!token || !email) {
    return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
  }
  // 2. On vérifie si l'utilisateur existe
  const user = await User.findOne({ email })
  if (!user) {
    return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
  }

  // 3. Vérification si l'email est déjà vérifié
  if (user.emailVerification.isVerified) {
    return ApiResponse.error(res, t('auth:errors.email_already_verified'), 400)
  }

  // 4. Vérification du token
  if (user.emailVerification.token !== token) {
    return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
  }
  if (
    user.emailVerification.expiration &&
    user.emailVerification.expiration < new Date()
  ) {
    return ApiResponse.error(res, t('auth:errors.code_expired'), 400)
  }

  // 5. Mise à jour de l'utilisateur
  user.emailVerification.isVerified = true
  user.emailVerification.token = undefined
  user.emailVerification.expiration = undefined
  await user.save()

  // 6. On génère le cookie de session
  const session = await SessionService.createOrUpdateSession(
    user,
    req,
    rememberMe,
  )
  user.lastLogin = new Date()
  await user.save()
  generateCookie(res, user, rememberMe, session.sessionId)

  // 7. Envoyer un email de bienvenue
  // TODO: envoyer un email de bienvenue

  return ApiResponse.success(res, {}, t('auth:success.email_verified'), 200)
})

export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email } = req.body

    if (!email || !validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }

    const user = await User.findOne({ email })
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    if (user.emailVerification.isVerified) {
      return ApiResponse.error(
        res,
        t('auth:errors.email_already_verified'),
        400,
      )
    }

    // Générer un nouveau token si l'ancien a expiré
    await handleUnverifiedUser(user)
    await sendVerificationEmail(
      t as TFunction,
      user,
      user.emailVerification.token!,
    )

    return ApiResponse.success(
      res,
      {},
      t('auth:success.verification_email_resent'),
      200,
    )
  },
)

export const getActiveSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user
    const currentSessionId = req.cookies?.sessionId

    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    const sessions = SessionService.getActiveSessions(user, currentSessionId)

    return ApiResponse.success(res, { sessions })
  },
)

export const revokeSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    const { sessionId } = req.params
    if (!sessionId) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    const session = user.loginHistory.find(
      (session: LoginHistory) => session.sessionId === sessionId,
    )
    if (!session) {
      return ApiResponse.error(res, t('auth:errors.session_not_found'), 404)
    }

    // On ne peut pas révoquer la session courante
    if (session.sessionId === req.cookies?.sessionId) {
      return ApiResponse.error(
        res,
        t('auth:errors.cannot_revoke_current_session'),
        400,
      )
    }
    // Supprimer la session
    SessionService.revokeSession(user, sessionId)
    await user.save()

    return ApiResponse.success(res, {}, t('auth:success.session_revoked'), 200)
  },
)

export const revokeAllSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = await User.findById(req.user._id)

    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // Supprimer toutes les sessions
    SessionService.revokeAllSessions(user)
    await user.save()

    return ApiResponse.success(
      res,
      {},
      t('auth:success.all_sessions_revoked'),
      200,
    )
  },
)
