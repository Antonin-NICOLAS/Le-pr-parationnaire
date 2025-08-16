import mongoose, { Document, Schema } from 'mongoose'

export interface ISession extends Document {
  sessionId: string
  userId: Schema.Types.ObjectId
  ip: string
  userAgent: string
  location?: string
  deviceType?: string
  browser?: string
  os?: string
  lastActive: Date
  expiresAt: Date
  refreshToken?: string
  refreshTokenVersion?: number
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  refreshToken: { type: String, unique: true },
  refreshTokenVersion: { type: Number, default: 0 },
  ip: String,
  userAgent: String,
  location: String,
  deviceType: String,
  browser: String,
  os: String,
  lastActive: { type: Date, default: Date.now },
  expiresAt: Date,
})

export default mongoose.model<ISession>('Session', SessionSchema)
