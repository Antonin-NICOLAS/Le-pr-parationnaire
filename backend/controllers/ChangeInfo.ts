import User from '../models/User.js'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { Request, Response } from 'express'
import { TFunction } from 'i18next'
// Helpers
import {
  handleUnverifiedUser,
  hashPassword,
  comparePassword,
  validatePassword,
  validateEmail,
} from '../helpers/AuthHelpers.js'
import {
  sendChangeEmailStep1,
  sendChangeEmailStep2,
} from '../emails/SendMail.js'

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
      return ApiResponse.error(res, t('auth:errors.invalid_password'), 400)
    }

    // 3. Vérification du nouveau mot de passe
    if (!validatePassword(newPassword)) {
      return ApiResponse.error(res, t('auth:errors.invalid_password'), 400)
    }

    // 4. Mise à jour du mot de passe
    await User.findByIdAndUpdate(user._id, {
      password: await hashPassword(newPassword),
    })

    return ApiResponse.success(res, {}, t('auth:success.password_changed'), 200)
  },
)

///////// CHANGE EMAIL FLOW ////////

// 1. Send email verification to current email
export const changeEmailStep1 = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    const user = await User.findById(req.user._id)

    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 1. Generate a verification code
    await handleUnverifiedUser(user)

    // 2. Send email with verification code
    await sendChangeEmailStep1(
      t as TFunction,
      user,
      user.emailVerification.token!,
    )

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
    const user = await User.findById(req.user._id)
    const { email } = req.body

    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return ApiResponse.error(res, t('auth:errors.invalid_email'), 400)
    }

    // 2. Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return ApiResponse.error(res, t('auth:errors.email_exists'), 400)
    }

    user.email = email
    user.emailVerification.isVerified = false

    // 3. Génération d'un code OTP
    await handleUnverifiedUser(user)
    await user.save()

    // 5. Envoi du code de vérification à la nouvelle adresse email
    await sendChangeEmailStep2(
      t as TFunction,
      user,
      user.emailVerification.token!,
    )
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
    const user = await User.findById(req.user._id)
    const { code } = req.body

    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // 1. Vérification du code
    if (!code || code.length !== 6 || code !== user.emailVerification.token) {
      return ApiResponse.error(res, t('auth:errors.invalid_code'), 400)
    }

    // 2. Mise à jour de l'email de l'utilisateur
    user.emailVerification.isVerified = true
    user.emailVerification.token = undefined
    user.emailVerification.expiration = undefined
    await user.save()

    return ApiResponse.success(res, {}, t('auth:success.email_verified'), 200)
  },
)

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = await User.findById(req.user._id)
    if (!user) {
      return ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    }

    // Delete user account
    await User.findByIdAndDelete(user._id)

    return ApiResponse.success(res, {}, t('auth:success.account_deleted'), 200)
  },
)
