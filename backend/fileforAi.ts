import User from './models/User.js'
import type { LoginHistory } from './models/User.js'
import { asyncHandler } from './helpers/AsyncHandler.js'
import { ApiResponse } from './helpers/ApiResponse.js'
import { SessionService } from './services/SessionService.js'
import bcrypt from 'bcrypt'
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
  generateResetToken,
} from './helpers/AuthHelpers.js'
// Emails
import {
  sendVerificationEmail,
  sendLoginEmail,
  sendResetPasswordEmail,
} from './emails/SendMail.js'
import { generateSecureCode } from './helpers/2FAHelpers.js'

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
  const emailToken = generateSecureCode()
  const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // 8. On crée l'utilisateur
  const user = await User.create({
    lastName,
    firstName,
    email,
    password: hashedPassword,
    emailVerification: {
      token: emailToken,
      expiration,
    },
    language: i18next.language,
  })

  await sendVerificationEmail(t as TFunction, user, emailToken)

  return ApiResponse.success(
    res,
    {
      requiresVerification: true,
      email: user.email,
      rememberMe: rememberMe,
    },
    t('auth:success.registered'),
    200,
  )
})

// 1ère étape lors du login : Si l'utilisateur a l'option WebAuthn activée et Login avec WebAuthn alors on lui propose de se connecter par clé d'accès
export const checkAuthStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query

    let isLoginWithWebAuthn = false

    // 1. Vérification de l'email
    if (email && validateEmail(decodeURIComponent(email as string))) {
      const user = await User.findOne({ email })
      if (user) {
        isLoginWithWebAuthn =
          (user.loginWithWebAuthn && user.twoFactor.webauthn.isEnabled) || false
      }
    }

    return ApiResponse.success(res, {
      webauthn: isLoginWithWebAuthn,
    })
  },
)

// Login avec le mot de passe après checkAuthStatus
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
    return ApiResponse.info(
      res,
      {
        requiresVerification: true,
        email: user.email,
        rememberMe: rememberMe,
      },
      t('auth:errors.email_not_verified'),
      403,
    )
  }

  //5 bis. Check if user has 2FA enabled
  if (user.twoFactor.isEnabled) {
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

// Déconnexion de l'utilisateur
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { t } = req
  const sessionId = req.cookies?.sessionId
  const user = await User.findById(req.user._id)

  // Clear cookies
  res.clearCookie('accessToken', {
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
  await user?.save()

  return ApiResponse.success(res, {}, t('auth:success.logged_out'), 200)
})

// route : /profile, si utilisateur toujours connecté, renvoie les données
export const checkSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user
    if (!user.emailVerification.isVerified) {
      return ApiResponse.info(
        res,
        {
          requiresVerification: true,
          email: user.email,
          rememberMe: false,
        },
        t('auth:errors.email_not_verified'),
        403,
      )
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

// Fonction appelée souvent après register pour la vérification de l'email, c'est elle qui envoie les cookies d'authentification après la registration
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token, email, rememberMe = false } = req.body
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
