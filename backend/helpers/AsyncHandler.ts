import { NextFunction, Request, Response } from 'express'
import { ApiResponse } from './ApiResponse.js'

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err) =>
      ApiResponse.serverError(res, req.t, err),
    )
