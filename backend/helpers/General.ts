import { type IUser } from '../models/User.js'
import { ApiResponse } from './ApiResponse.js'
import { type Response } from 'express'
import { type TFunction } from 'i18next'

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
