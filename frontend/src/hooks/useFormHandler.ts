import { useCallback, useState } from 'react'
import { z } from 'zod'

export interface FormHandlerResult<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  handleChange: (field: string, value: any) => void
  handleBlur: (field: string) => void
  handleSubmit: (
    onSubmit: (values: T) => Promise<void> | void,
  ) => (e?: React.FormEvent) => Promise<void>
  setFieldError: (field: string, error: string) => void
  setFieldValue: (field: string, value: any) => void
  clearErrors: () => void
  reset: (newValues?: Partial<T>) => void
  validateField: (field: string) => boolean
  validateForm: () => boolean
}

interface UseFormHandlerOptions<T> {
  initialValues: T
  validationSchema?: z.ZodSchema<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormHandler<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormHandlerOptions<T>): FormHandlerResult<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback(
    (field: string, valueOverride?: any): boolean => {
      if (!validationSchema) return true

      const valueToValidate = valueOverride ?? values[field]

      try {
        if (validationSchema instanceof z.ZodObject) {
          const shape = (validationSchema as z.ZodObject<any>).shape
          const fieldSchema = shape[field as keyof typeof shape]
          if (fieldSchema) {
            fieldSchema.parse(valueToValidate)
            setErrors((prev) => {
              const newErrors = { ...prev }
              delete newErrors[field]
              return newErrors
            })
            return true
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues[0]?.message || 'Invalid value'
          setErrors((prev) => ({ ...prev, [field]: fieldError }))
          return false
        }
      }
      return true
    },
    [values, validationSchema],
  )

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true

    try {
      validationSchema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
        return false
      }
    }
    return false
  }, [values, validationSchema])

  const handleChange = useCallback(
    (field: string, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }))

      if (validateOnChange && touched[field]) {
        validateField(field, value)
      }
    },
    [validateOnChange, validateField, touched],
  )

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      if (validateOnBlur && values[field] !== initialValues[field]) {
        validateField(field)
      }
    },
    [validateOnBlur, validateField, values, initialValues],
  )

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault()
        }

        setIsSubmitting(true)

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
          (acc, key) => {
            acc[key] = true
            return acc
          },
          {} as Record<string, boolean>,
        )
        setTouched(allTouched)

        // Validate form
        if (!validateForm()) {
          setIsSubmitting(false)
          return
        }

        try {
          await onSubmit(values)
        } catch (error) {
          // Error handling is managed by the hook that calls onSubmit
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [values, validateForm],
  )

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const reset = useCallback(
    (newValues?: Partial<T>) => {
      setValues(newValues ? { ...initialValues, ...newValues } : initialValues)
      setErrors({})
      setTouched({})
      setIsSubmitting(false)
    },
    [initialValues],
  )

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setFieldValue,
    clearErrors,
    reset,
    validateField,
    validateForm,
  }
}
