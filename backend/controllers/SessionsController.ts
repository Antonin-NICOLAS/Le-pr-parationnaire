import type { LoginHistory } from '../models/User.js'
import { asyncHandler } from '../helpers/AsyncHandler.js'
import { ApiResponse } from '../helpers/ApiResponse.js'
import { SessionService } from '../services/SessionService.js'
import { Request, Response } from 'express'
import { assertUserExists } from '../helpers/General.js'

export const getActiveSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user

    if (!assertUserExists(user, res, t)) return
    const currentSessionId = req.cookies?.sessionId

    await SessionService.cleanupExpiredSessions(user)

    const sessions = SessionService.getActiveSessions(user, currentSessionId)

    return ApiResponse.success(res, { sessions })
  },
)

export const revokeSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req

    const { sessionId } = req.params
    if (!sessionId) {
      return ApiResponse.error(res, t('auth:errors.missing_fields'), 400)
    }

    const user = req.user
    if (!assertUserExists(user, res, t)) return

    await SessionService.cleanupExpiredSessions(user)

    const session = user.loginHistory.find(
      (session: LoginHistory) => session.sessionId === sessionId,
    )
    if (!session) {
      return ApiResponse.error(res, t('auth:errors.session_not_found'), 404)
    }

    // On ne peut pas révoquer la session courante
    if (session.sessionId === req.cookies?.sessionId) {
      return ApiResponse.error(
        res,
        t('auth:errors.cannot_revoke_current_session'),
        403,
      )
    }
    // Supprimer la session
    await SessionService.revokeSession(user, sessionId)

    return ApiResponse.success(res, {}, t('auth:success.session_revoked'), 200)
  },
)

export const revokeAllSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const { t } = req
    const user = req.user

    if (!assertUserExists(user, res, t)) return
    await SessionService.cleanupExpiredSessions(user)

    // Supprimer toutes les sessions
    await SessionService.revokeAllSessions(user)

    return ApiResponse.success(
      res,
      {},
      t('auth:success.all_sessions_revoked'),
      200,
    )
  },
)
