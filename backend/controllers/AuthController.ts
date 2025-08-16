import User from '../models/User.js'
import mongoose from 'mongoose'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { SessionService } from '../services/SessionService.js'
import ms from 'ms'
import { Request, Response } from 'express'
import i18next, { TFunction } from 'i18next'
// Helpers
import {
  hashPassword,
  comparePassword,
  validateEmail,
  validateName,
  validatePassword,
  getDeviceInfo,
  findLocation,
} from '../helpers/AuthHelpers.js'
// Emails
import { sendVerificationEmail, sendLoginEmail } from '../emails/SendMail.js'
import { TokenService } from '../services/TokenService.js'
import { generateSecureCode } from '../helpers/2FAHelpers.js'
import { assertUserExists, handleUnverifiedUser } from '../helpers/General.js'

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const rawRefreshToken = req.cookies?.refreshToken
    const sessionId = req.cookies?.sessionId

    if (!rawRefreshToken || !sessionId) {
      return ApiResponse.error(res, t('auth:errors.unauthorized'), 401)
    }

    console.log('[REFRESH] Raw refresh token:', rawRefreshToken)

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const user = await User.findOne({
        'loginHistory.sessionId': sessionId,
      }).session(session)

      if (!user) {
        await session.abortTransaction()
        return ApiResponse.error(res, t('auth:errors.session_not_found'), 404)
      }

      const userSession = user.loginHistory.find(
        (s) => s.sessionId === sessionId,
      )
      console.log('[REFRESH] userSession:', userSession)

      if (!userSession || !userSession.refreshToken) {
        await session.abortTransaction()
        return ApiResponse.error(res, t('auth:errors.session_expired'), 401)
      }

      console.log('[REFRESH] Refresh token :', userSession.refreshToken)

      // 3. Vérifier l'expiration
      if (userSession.expiresAt.getTime() < Date.now()) {
        await session.abortTransaction()
        return ApiResponse.error(res, t('auth:errors.session_expired'), 401)
      }

      console.log(
        '[REFRESH] Session expirée à :',
        userSession.expiresAt,
        userSession.expiresAt.getTime() < Date.now(),
      )

      // 4. Vérifier le token
      const isValid = await TokenService.compareTokens(
        rawRefreshToken,
        userSession.refreshToken,
      )

      if (!isValid) {
        await User.updateOne(
          { _id: user._id },
          { $pull: { loginHistory: { sessionId } } },
        ).session(session)
        await session.commitTransaction()
        return ApiResponse.error(res, t('common:errors.bad_request'), 401)
      }

      // 5. Mettre à jour lastActive AVANT la génération des tokens
      userSession.lastActive = new Date()
      await user.save({ session })

      // 6. Générer nouveaux tokens
      const rememberMe = userSession.expiresAt.getTime() > Date.now() + ms('1d')
      const { accessToken } = await SessionService.createSessionWithTokens(
        user,
        req,
        res,
        rememberMe,
        sessionId,
      )

      await session.commitTransaction()
      return ApiResponse.success(res, { accessToken }, '', 200)
    } catch (error: any) {
      await session.abortTransaction()

      return ApiResponse.error(res, t('common:errors.server_error'), 500)
    } finally {
      session.endSession()
    }
  },
)

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
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
})

export const checkAuthStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query

    let isLoginWithWebAuthn = false

    // 1. Vérification de l'email
    if (email && validateEmail(decodeURIComponent(email as string))) {
      const user = await User.findOne({ email })
      if (user) {
        isLoginWithWebAuthn = user.authMethods.webauthn.isEnabled || false
      }
    }

    return ApiResponse.success(res, {
      webauthn: isLoginWithWebAuthn,
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

  await SessionService.cleanupExpiredSessions(user)

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

  // 6. Update last login and login history, génération des cookies avec le sessionId
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const {
      accessToken,
      refreshToken,
      session: userSession,
    } = await SessionService.createSessionWithTokens(user, req, res, rememberMe)

    user.lastLogin = new Date()
    await user.save({ session })
    await session.commitTransaction()

    const deviceInfo = getDeviceInfo(userSession.userAgent)
    const localisation = await findLocation(t, i18next.language, userSession.ip)

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
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { t } = req
  const sessionId = req.cookies?.sessionId

  // Find user with sessionId and delete the session
  const user = await User.findOne({ 'loginHistory.sessionId': sessionId })
  if (user) {
    user.loginHistory = user.loginHistory.filter(
      (session) => session.sessionId !== sessionId,
    )
    await user.save()
  }

  // Clear cookies
  res.clearCookie('accessToken', {
    path: '/',
    domain:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_SERVER
        : undefined,
  })
  res.clearCookie('refreshToken', {
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

  return ApiResponse.success(res, {}, t('auth:success.logged_out'), 200)
})

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

export const emailVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, email, rememberMe = false } = req.body
    const { t } = req

    // 1. Validation des champs
    if (!token) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }
    if (!email) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }
    // 2. On vérifie si l'utilisateur existe
    const user = await User.findOne({ email })
    if (!assertUserExists(user, res, t)) return

    // 3. Vérification si l'email est déjà vérifié
    if (user.emailVerification.isVerified) {
      return ApiResponse.error(
        res,
        t('auth:errors.email_already_verified'),
        400,
      )
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
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const { accessToken, refreshToken } =
        await SessionService.createSessionWithTokens(user, req, res, rememberMe)

      user.lastLogin = new Date()
      await user.save({ session })
      await session.commitTransaction()

      // 7. Send login email notification
      // TODO: implement welcome email sending

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

export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email } = req.body

    if (!email || !validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }

    const user = await User.findOne({ email })
    if (!assertUserExists(user, res, t)) return

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
