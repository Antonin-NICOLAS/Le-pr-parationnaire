import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { StringValue } from 'ms'

export class TokenService {
  static async generateRefreshToken() {
    return uuidv4() + uuidv4()
  }

  static async hashToken(token: string) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(token, salt)
  }

  static async compareTokens(token: string, hashedToken: string) {
    return await bcrypt.compare(token, hashedToken)
  }

  static generateRefreshTokenPayload(sessionId: string, version: number) {
    return jwt.sign({ sessionId, version }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    })
  }

  static generateAccessToken(
    user: any,
    duration: StringValue,
    sessionId: string,
    refreshTokenVersion?: number,
  ) {
    const payload = {
      jti: sessionId,
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
      rtv: refreshTokenVersion,
    }

    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: duration,
      algorithm: 'HS256',
    })
  }
}
