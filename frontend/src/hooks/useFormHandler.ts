import { useCallback, useState } from 'react'

import type { ApiCallResult } from './useApiCall'

export interface FormField {
  value: any
  error?: string
  touched?: boolean
}

export interface FormState {
  [key: string]: FormField
}

export interface FormHandlerConfig<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<any>
  resetOnSuccess?: boolean
}

export interface FormHandlerResult<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  loading: boolean
  error: string | null
  handleChange: (field: keyof T, value: any) => void
  handleBlur: (field: keyof T) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  setFieldError: (field: keyof T, error: string) => void
  setFieldValue: (field: keyof T, value: any) => void
  reset: () => void
  isValid: boolean
}

/**
 * Universal form handler that integrates with API calls
 */
export function useFormHandler<T extends Record<string, any>>(
  config: FormHandlerConfig<T>,
  apiCall?: ApiCallResult,
): FormHandlerResult<T> {
  const { initialValues, validate, onSubmit, resetOnSuccess = true } = config

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }))

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors],
  )

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      // Validate field on blur if validation function exists
      if (validate) {
        const fieldErrors = validate(values)
        if (fieldErrors[field]) {
          setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }))
        }
      }
    },
    [values, validate],
  )

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Mark all fields as touched
      const touchedFields = Object.keys(values).reduce(
        (acc, key) => {
          acc[key as keyof T] = true
          return acc
        },
        {} as Partial<Record<keyof T, boolean>>,
      )
      setTouched(touchedFields)

      // Validate all fields
      if (validate) {
        const validationErrors = validate(values)
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
          return
        }
      }

      try {
        const result = await onSubmit(values)

        if (result?.success && resetOnSuccess) {
          reset()
        }
      } catch (error) {
        // Error handling is managed by the API call hook
        console.error('Form submission error:', error)
      }
    },
    [values, validate, onSubmit, resetOnSuccess],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    loading: apiCall?.loading || false,
    error: apiCall?.error || null,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setFieldValue,
    reset,
    isValid,
  }
}
