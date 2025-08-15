import type { UserDocument } from '../models/User.js'
import type { TFunction } from 'i18next'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
      token?: string
      language?: string
      t: TFunction
    }
  }
}

export {}
