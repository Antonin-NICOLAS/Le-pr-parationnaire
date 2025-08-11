// src/services/TokenService.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import ms, { StringValue } from 'ms'

export class TokenService {
  static async generateRefreshToken() {
    return uuidv4() + uuidv4()
  }

  static async hashToken(token: string) {
    return bcrypt.hash(token, 10)
  }

  static async compareTokens(token: string, hashedToken: string) {
    return bcrypt.compare(token, hashedToken)
  }

  static generateAccessToken(
    user: any,
    duration: StringValue,
    sessionId: string,
  ) {
    const payload = {
      jti: sessionId,
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    }

    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: ms(duration),
      algorithm: 'HS256',
    })
  }
}
