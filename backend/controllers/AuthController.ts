import User from '../models/User.js'
import Session from '../models/Session.js'
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
  getDeviceInfo,
} from '../helpers/AuthHelpers.js'
import { validateEmail } from '../helpers/Validators.js'
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

    // 1. Trouver la session
    const userSession = await Session.findOne({
      sessionId,
    })

    if (!userSession) {
      return ApiResponse.error(res, t('auth:errors.session_not_found'), 404)
    }
    console.log('[REFRESH] Raw refresh token:', rawRefreshToken)
    console.log('[REFRESH] Refresh token :', userSession.refreshToken)

    // 2. Vérifier l'expiration
    if (userSession.expiresAt.getTime() < Date.now()) {
      return ApiResponse.error(res, t('auth:errors.session_expired'), 401)
    }

    // 3. Vérifier le token
    const isValid = await TokenService.compareTokens(
      rawRefreshToken,
      userSession.refreshToken || '',
    )

    if (!isValid) {
      await Session.deleteOne({ sessionId })
      return ApiResponse.error(res, t('common:errors.bad_request'), 401)
    }

    // 4. Trouver l'utilisateur
    const user = await User.findOne(
      { _id: userSession.userId },
      { email: 1, role: 1, tokenVersion: 1 },
    ).lean()

    if (!assertUserExists(user, res, t)) {
      return
    }

    // 5. Génération des cookies
    const rememberMe = userSession.expiresAt.getTime() > Date.now() + ms('2d')
    const { accessToken } = await SessionService.createSessionWithTokens(
      t,
      user,
      req,
      res,
      rememberMe,
      sessionId,
    )

    return ApiResponse.success(res, { accessToken }, '', 200)
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

  const isMatch = await comparePassword(password, user.password)
  if (!isMatch) {
    return ApiResponse.error(res, t('auth:errors.invalid_credentials'), 404)
  }

  if (!user.emailVerification.isVerified) {
    const { token } = await handleUnverifiedUser(user)
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

  // 7. Send login email notification
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

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return ApiResponse.error(res, t('auth:errors.email_exists'), 409)
  }

  const hashedPassword = await hashPassword(password)

  const emailToken = generateSecureCode()
  const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)

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

    if (user.emailVerification.isVerified) {
      return ApiResponse.error(
        res,
        t('auth:errors.email_already_verified'),
        400,
      )
    }

    if (user.emailVerification.token !== token) {
      return ApiResponse.error(res, t('auth:errors.2fa.invalid_code'), 400)
    }
    if (
      user.emailVerification.expiration &&
      user.emailVerification.expiration < new Date()
    ) {
      return ApiResponse.error(res, t('auth:errors.code_expired'), 400)
    }

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

    // 7. Send login email notification
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
    const { token } = await handleUnverifiedUser(user)
    await sendVerificationEmail(t as TFunction, user, token)

    return ApiResponse.success(
      res,
      {},
      t('auth:success.verification_email_resent'),
      200,
    )
  },
)
