import React from 'react'
import CustomInput from './CustomInput'
import ErrorMessage from './ErrorMessage'
import type { LucideIcon } from 'lucide-react'
import type { FormHandlerResult } from '../../hooks/useFormHandler'

interface FormFieldProps {
  name: string
  label?: string
  type?: string
  placeholder?: string
  icon?: LucideIcon
  form: FormHandlerResult<any>
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  disabled?: boolean
  helperText?: string
  className?: string
}

/**
 * Unified form field component that integrates with useFormHandler
 */
const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  icon,
  form,
  required = false,
  autoComplete,
  autoFocus = false,
  disabled = false,
  helperText,
  className = '',
}) => {
  const { values, errors, touched, handleChange, handleBlur } = form
  const fieldError = touched[name] && errors[name] ? errors[name] : undefined

  return (
    <div className={`space-y-2 ${className}`}>
      <CustomInput
        type={type}
        label={label}
        placeholder={placeholder}
        value={values[name] || ''}
        onChange={(e) => handleChange(name, e.target.value)}
        onBlur={() => handleBlur(name)}
        icon={icon}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        error={fieldError}
        helperText={helperText}
      />

      {fieldError && <ErrorMessage message={fieldError} type='error' />}
    </div>
  )
}

export default FormField
