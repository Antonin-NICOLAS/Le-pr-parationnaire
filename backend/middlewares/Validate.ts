import { ZodObject, ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../helpers/ApiResponse'

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body) // si ça plante → catch
      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0]?.message ?? 'Invalid request data'
        return ApiResponse.error(res, firstError, 400)
      }
      return ApiResponse.error(res, 'Validation failed', 400)
    }
  }
