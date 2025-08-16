import User from '../models/User.js'
import Session from '../models/Session.js'
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
      // 1. Trouver la session
      const userSession = await Session.findOne({
        sessionId,
      }).session(session)

      if (!userSession) {
        await session.abortTransaction()
        return ApiResponse.error(res, t('auth:errors.session_not_found'), 404)
      }

      // 2. Vérifier l'expiration
      if (userSession.expiresAt.getTime() < Date.now()) {
        await session.abortTransaction()
        return ApiResponse.error(res, t('auth:errors.session_expired'), 401)
      }

      // 3. Vérifier le token
      const isValid = await TokenService.compareTokens(
        rawRefreshToken,
        userSession.refreshToken || '',
      )

      if (!isValid) {
        await Session.deleteOne({ sessionId }).session(session)
        await session.commitTransaction()
        return ApiResponse.error(res, t('common:errors.bad_request'), 401)
      }
      console.log('[REFRESH] userSession:', userSession)

      console.log('[REFRESH] Refresh token :', userSession.refreshToken)

      console.log(
        '[REFRESH] Session expirée à :',
        userSession.expiresAt,
        userSession.expiresAt.getTime() < Date.now(),
      )

      // 4. Trouver l'utilisateur
      const user = await User.findOne(
        { _id: userSession.userId },
        { email: 1, role: 1, tokenVersion: 1 },
      )
        .session(session)
        .lean()

      if (!assertUserExists(user, res, t)) {
        return
      }

      // 5. Génération des cookies
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
    const rawEmail = decodeURIComponent(email as string)
    if (rawEmail && validateEmail(rawEmail)) {
      const user = await User.findOne({ email: rawEmail })
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

  // 1. Validation des entrées
  if (!email || !password) {
    return ApiResponse.error(res, t('auth:errors.missing_credentials'), 400)
  }

  if (!validateEmail(email)) {
    return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
  }

  // 2. Récupération utilisateur avec projection minimale
  const user = await User.findOne(
    { email },
    {
      email: 1,
      password: 1,
      'emailVerification.isVerified': 1,
      'emailVerification.token': 1,
      'emailVerification.expiration': 1,
      'twoFactor.isEnabled': 1,
      'twoFactor.email.isEnabled': 1,
      'twoFactor.app.isEnabled': 1,
      'twoFactor.webauthn.isEnabled': 1,
      'twoFactor.preferredMethod': 1,
      role: 1,
      tokenVersion: 1,
    },
  ).lean()

  if (!user) {
    return ApiResponse.error(res, t('auth:errors.invalid_credentials'), 404)
  }

  // 3. Vérification du mot de passe
  const isMatch = await comparePassword(password, user.password)
  if (!isMatch) {
    return ApiResponse.error(res, t('auth:errors.invalid_credentials'), 404)
  }

  // 4. Check if user is verified
  if (!user.emailVerification.isVerified) {
    const token = await handleUnverifiedUser(user)
    await sendVerificationEmail(t as TFunction, user, token)
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

  await SessionService.cleanupExpiredSessions(user._id)

  // 5. Check if user has 2FA enabled
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

  if (sessionId) {
    // Supprimer la session de la nouvelle collection
    await SessionService.revokeSession(sessionId)
  }

  // Clear cookies
  const cookieOptions = {
    path: '/',
    domain:
      process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
  }

  res.clearCookie('accessToken', cookieOptions)
  res.clearCookie('refreshToken', cookieOptions)
  res.clearCookie('sessionId', cookieOptions)

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
    const user = await User.findOne(
      { email },
      {
        email: 1,
        'emailVerification.isVerified': 1,
        'emailVerification.expiration': 1,
        'emailVerification.token': 1,
        role: 1,
        tokenVersion: 1,
      },
    ).lean()
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
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'emailVerification.isVerified': true,
        },
        $unset: {
          'emailVerification.token': 1,
          'emailVerification.expiration': 1,
        },
      },
    )

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
    const token = await handleUnverifiedUser(user)
    await sendVerificationEmail(t as TFunction, user, token)

    return ApiResponse.success(
      res,
      {},
      t('auth:success.verification_email_resent'),
      200,
    )
  },
)
