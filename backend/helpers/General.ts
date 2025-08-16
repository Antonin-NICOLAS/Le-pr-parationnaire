import { ApiResponse } from './ApiResponse.js'
import { type Response } from 'express'
import { type TFunction } from 'i18next'
import User, { type IUser } from '../models/User.js'
import { generateSecureCode } from './2FAHelpers.js'

export function assertUserExists(
  user: IUser | null | undefined,
  res: Response,
  t: TFunction,
): user is IUser {
  if (!user) {
    ApiResponse.error(res, t('auth:errors.user_not_found'), 404)
    return false
  }
  return true
}

export async function handleUnverifiedUser(user: IUser) {
  if (
    !user.emailVerification.token ||
    !user.emailVerification.expiration ||
    user.emailVerification.expiration < new Date()
  ) {
    const token = generateSecureCode()
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'emailVerification.token': token,
          'emailVerification.expiration': expiration,
        },
      },
    )
    return token
  }
  return user.emailVerification.token
}
