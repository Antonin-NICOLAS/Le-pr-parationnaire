import type React from 'react'
import { useState, forwardRef } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: LucideIcon
  wrapperClassName?: string
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      wrapperClassName = '',
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className={`w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={props.id}
            className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            {Icon && <Icon size={16} />}
            <span>{label}</span>
          </label>
        )}

        <div className='relative'>
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={`focus:ring-3 focus:ring-primary-500/20 w-full rounded-md border-2 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-300 ease-in-out focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${
              error
                ? 'border-red-500 focus:border-red-500'
                : 'focus:border-primary-500 border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
            } ${disabled ? 'cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-700' : 'focus:-translate-y-0.5'} ${className} `}
            {...props}
          />

          {isPassword && (
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 transition-colors duration-200 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && (
          <p className='animate-slide-in mt-2 text-sm text-red-600 dark:text-red-400'>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

CustomInput.displayName = 'CustomInput'

export default CustomInput
