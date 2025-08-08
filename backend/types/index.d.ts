import type { UserDocument } from '../models/User.js'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
      token?: string
      language?: string
      t: (key: string) => string
    }
  }
}

export {}
