import { Response } from 'express'

export class ApiResponse {
  static success(
    res: Response,
    data: any = {},
    message?: string,
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    })
  }

  static error(res: Response, error: string, statusCode = 400, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error,
      ...details,
    })
  }

  static serverError(res: Response, t: any, error?: any) {
    console.error('Server error:', error)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}
