import { AxiosError } from 'axios'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

// Base types for API responses
export interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  [key: string]: any
}

// Hook return interface
export interface ApiCallResult<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<ApiResponse>
  resetError: () => void
  resetData: () => void
}

// Configuration for API calls
export interface ApiCallConfig {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

/**
 * Universal hook for API calls with unified error handling, loading states, and toast management
 */
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  config: ApiCallConfig = {},
): ApiCallResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  } = config

  const execute = useCallback(
    async (...args: any[]): Promise<ApiResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiFunction(...args)
        const result: ApiResponse = response.data || response

        if (result.success) {
          const { success, message, error, ...rest } = result
          setData(rest as T)

          // Success toast
          if (showSuccessToast) {
            const message =
              result.message ||
              successMessage ||
              'Operation completed successfully'
            toast.success(message)
          }

          // Success callback
          if (onSuccess) {
            onSuccess(result.data || result)
          }

          return result
        } else {
          // API returned success: false
          const errorMsg = result.error || result.message || 'Operation failed'
          setError(errorMsg)

          if (showErrorToast) {
            toast.error(errorMsg || errorMessage)
          }

          if (onError) {
            onError(errorMsg)
          }

          return result
        }
      } catch (err: any) {
        let errorMsg = 'An unexpected error occurred'

        if (err instanceof AxiosError) {
          errorMsg =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            'Network error occurred'
        } else if (err instanceof Error) {
          errorMsg = err.message
        }

        setError(errorMsg)

        if (showErrorToast) {
          toast.error(errorMessage || errorMsg)
        }

        if (onError) {
          onError(errorMsg)
        }

        return {
          success: false,
          error: errorMsg,
        }
      } finally {
        setLoading(false)
      }
    },
    [
      apiFunction,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
    ],
  )

  const resetError = useCallback(() => {
    setError(null)
  }, [])
  const resetData = useCallback(() => {
    setData(null)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    resetError,
    resetData,
  }
}
