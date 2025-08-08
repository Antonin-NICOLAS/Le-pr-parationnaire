import mongoose, { Document, Schema } from 'mongoose'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

export type BackupCode = {
  code: string
  used: boolean
}

export type WebAuthnCredential = {
  id: string
  publicKey: string
  counter: number
  deviceType: string
  deviceName: string
  transports: AuthenticatorTransportFuture[]
  lastUsed?: Date
  createdAt?: Date
}

export type LoginHistory = {
  sessionId: string
  ip?: string
  userAgent?: string
  location?: string
  deviceType?: string
  browser?: string
  os?: string
  lastActive?: Date
  expiresAt?: Date
}

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId
  lastName: string
  firstName: string
  avatarUrl?: string
  email: string
  password: string
  tokenVersion: number
  lastLogin?: Date
  lastEmailChange?: Date
  loginHistory: {
    sessionId: string
    ip?: string
    userAgent?: string
    location?: string
    deviceType?: string
    browser?: string
    os?: string
    lastActive?: Date
    expiresAt?: Date
  }[]
  emailVerification: {
    token?: string
    expiration?: Date
    isVerified: boolean
  }
  resetPassword: {
    token?: string
    expiration?: Date
  }
  twoFactor: {
    email: {
      isEnabled: boolean
      token?: string
      expiration?: Date
    }
    app: {
      isEnabled: boolean
      secret?: string
    }
    webauthn: {
      isEnabled: boolean
      challenge?: string
      expiration?: Date
      credentials: WebAuthnCredential[]
    }
    preferredMethod: 'email' | 'app' | 'webauthn' | 'none'
    backupCodes: BackupCode[]
    securityQuestions: {
      question: string
      answer: string
    }[]
  }
  role: 'user' | 'admin'
  language: 'en' | 'fr' | 'es' | 'de'
  theme: 'dark' | 'light' | 'auto'
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  avatarUrl: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 8 },
  tokenVersion: { type: Number, default: 0 },
  lastLogin: Date,
  lastEmailChange: Date,
  loginHistory: [
    {
      sessionId: { type: String, unique: true },
      ip: String,
      userAgent: String,
      location: String,
      deviceType: String,
      browser: String,
      os: String,
      lastActive: { type: Date, default: Date.now },
      expiresAt: Date,
    },
  ],
  emailVerification: {
    token: String,
    expiration: Date,
    isVerified: { type: Boolean, default: false },
  },
  resetPassword: {
    token: String,
    expiration: Date,
  },
  twoFactor: {
    email: {
      isEnabled: { type: Boolean, default: false },
      token: String,
      expiration: Date,
    },
    app: {
      isEnabled: { type: Boolean, default: false },
      secret: String,
    },
    webauthn: {
      isEnabled: { type: Boolean, default: false },
      challenge: String,
      expiration: Date,
      credentials: [
        {
          id: String,
          publicKey: String,
          counter: Number,
          deviceType: String,
          deviceName: String,
          transports: [String],
          lastUsed: { type: Date, default: Date.now },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    preferredMethod: {
      type: String,
      enum: ['email', 'app', 'webauthn', 'none'],
      default: 'none',
    },
    backupCodes: [
      {
        code: String,
        used: { type: Boolean, default: false },
      },
    ],
    securityQuestions: [
      {
        question: String,
        answer: { type: String, select: false },
      },
    ],
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  language: {
    type: String,
    enum: ['en', 'fr', 'es', 'de'],
    default: 'en',
  },
  theme: {
    type: String,
    enum: ['dark', 'light', 'auto'],
    default: 'light',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<IUser>('User', UserSchema)
