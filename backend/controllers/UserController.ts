import User from '../models/User.js'
import { logout } from './AuthController.js'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { NextFunction, Request, Response } from 'express'
import { TFunction } from 'i18next'
// Helpers
import {
  hashPassword,
  comparePassword,
  validatePassword,
  validateEmail,
} from '../helpers/AuthHelpers.js'
import {
  sendChangeEmailStep1,
  sendChangeEmailStep2,
} from '../emails/SendMail.js'
import { generateSecureCode } from '../helpers/2FAHelpers.js'
import { handleUnverifiedUser } from '../helpers/General.js'

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const { currentPassword, newPassword } = req.body
    const user = req.user

    // 1. Validation des champs
    if (!currentPassword || !newPassword) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    // 2. Vérification de l'ancien mot de passe
    const isMatch = await comparePassword(currentPassword, user.password)
    if (!isMatch) {
      return ApiResponse.error(res, t('auth:errors.password_incorrect'), 400)
    }

    // 3. Vérification du nouveau mot de passe
    if (!validatePassword(newPassword)) {
      return ApiResponse.error(res, t('auth:errors.invalid_password'), 400)
    }

    // 4. Vérification si le mot de passe est similaire à l'ancien
    const isSimilar = await comparePassword(newPassword, user.password)
    if (isSimilar) {
      return ApiResponse.error(res, t('auth:errors.similar_password'), 400)
    }

    // 5. Mise à jour du mot de passe
    await User.updateOne(
      { _id: user._id },
      { $set: { password: await hashPassword(newPassword) } },
    )

    return ApiResponse.success(res, {}, t('auth:success.password_changed'), 200)
  },
)

///////// CHANGE EMAIL FLOW ////////

// 1. Send email verification to current email
export const changeEmailStep1 = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    const user = req.user

    const code = await handleUnverifiedUser(user)

    if (!code) {
      return ApiResponse.error(
        res,
        t('auth:errors.token_generation_failed'),
        500,
      )
    }

    await sendChangeEmailStep1(t as TFunction, user, code)

    return ApiResponse.success(
      res,
      {},
      t('auth:success.emailchange1_sent'),
      200,
    )
  },
)

// 2. Enter new email, validate it, and send verification code to new email
export const changeEmailStep3 = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user
    const { email } = req.body

    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }

    // 2. Vérification si l'email existe déjà
    const emailExists = await User.exists({ email })
    if (emailExists) {
      return ApiResponse.error(res, t('auth:errors.email_exists'), 400)
    }

    // 3. Mise à jour atomique
    const token = generateSecureCode()
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          email,
          'emailVerification.token': token,
          'emailVerification.expiration': expiration,
          'emailVerification.isVerified': false,
        },
      },
    )

    // 4. Envoi du code de vérification à la nouvelle adresse email
    await sendChangeEmailStep2(t as TFunction, { ...user, email }, token)
    return ApiResponse.success(
      res,
      {},
      t('auth:success.emailchange2_sent'),
      200,
    )
  },
)
// 3. Verify new email with code
export const changeEmailStep2Step4 = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user
    const { code } = req.body

    // 1. Vérification du code
    if (!code || code.length !== 6 || code !== user.emailVerification.token) {
      return ApiResponse.error(res, t('auth:errors.invalid_code'), 400)
    }

    // 2. Mise à jour atomique
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'emailVerification.isVerified': true,
          'emailVerification.token': undefined,
          'emailVerification.expiration': undefined,
        },
      },
    )

    return ApiResponse.success(res, {}, t('auth:success.email_verified'), 200)
  },
)

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { t } = req

    await logout(req, res, next)

    // Delete user account
    await User.findByIdAndDelete(req.user._id)

    return ApiResponse.success(res, {}, t('auth:success.account_deleted'), 200)
  },
)
