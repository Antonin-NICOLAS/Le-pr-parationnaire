import User from '../models/User.js'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { TFunction } from 'i18next'
// Helpers
import {
  hashPassword,
  comparePassword,
  generateResetToken,
  resetTokenHash,
} from '../helpers/AuthHelpers.js'
import { assertUserExists } from '../helpers/General.js'
// Emails
import { sendResetPasswordEmail } from '../emails/SendMail.js'

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return ApiResponse.success(
        res,
        {},
        t('auth:success.reset_email_sent'),
        200,
      )
    }

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

    if (user.resetPassword.token) {
      user.resetPassword.token = undefined
      user.resetPassword.expiration = undefined
    }
    const rawToken = generateResetToken()
    const hashedToken = resetTokenHash(rawToken)
    const hashedEmail = bcrypt.hashSync(email, 10)
    user.resetPassword.token = hashedToken
    user.resetPassword.expiration = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    const link = `${process.env.FRONTEND_SERVER}/reset-password?token=${rawToken}&email=${hashedEmail}`

    await sendResetPasswordEmail(t as TFunction, user, link)

    return ApiResponse.success(res, {}, t('auth:success.reset_email_sent'), 200)
  },
)

export const verifyResetToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { token } = req.body

    // 1. Validation du token
    if (!token) {
      return ApiResponse.error(res, t('common:errors.bad_request'), 400)
    }

    // 2. Recherche de l'utilisateur avec ce token
    const hashedToken = resetTokenHash(token)
    const users = await User.find({ 'resetPassword.token': hashedToken })

    // 3. Vérification qu'un seul utilisateur a ce token
    if (users.length === 0) {
      return ApiResponse.error(res, t('auth:errors.invalid_token'), 400)
    }

    if (users.length > 1) {
      // Log l'erreur pour investigation
      console.error(`Multiple users found with same reset token: ${token}`)
      return ApiResponse.error(res, t('common:errors.server_error'), 500)
    }

    const user = users[0]

    // 4. Vérification de l'expiration du token
    if (
      user.resetPassword.expiration &&
      user.resetPassword.expiration < new Date()
    ) {
      return ApiResponse.error(res, t('auth:errors.token_expired'), 400)
    }

    // 5. Retour des informations de base de l'utilisateur
    return ApiResponse.success(res, {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
  },
)

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, token, newPassword } = req.body
    const { t } = req

    if (!token) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    const hashedToken = resetTokenHash(token)
    const user = await User.findOne({ 'resetPassword.token': hashedToken })
    if (!assertUserExists(user, res, t)) return

    if (!bcrypt.compareSync(user.email, email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_token'), 400)
    }
    if (
      user.resetPassword.expiration &&
      user.resetPassword.expiration < new Date()
    ) {
      return ApiResponse.error(res, t('auth:errors.token_expired'), 400)
    }

    const isSimilar = await comparePassword(newPassword, user.password)
    if (isSimilar) {
      return ApiResponse.error(res, t('auth:errors.similar_password'), 400)
    }

    user.password = await hashPassword(newPassword)
    user.resetPassword.token = undefined
    user.resetPassword.expiration = undefined
    await user.save()

    // 7. On envoie un mail de confirmation
    // TODO: envoyer un email de confirmation

    return ApiResponse.success(res, {}, t('auth:success.password_reset'), 200)
  },
)
