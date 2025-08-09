import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
  description?: string
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  label,
  description,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-8',
  }

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0',
    md: checked ? 'translate-x-5' : 'translate-x-0',
    lg: checked ? 'translate-x-6' : 'translate-x-0',
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className='flex flex-1 flex-col'>
        {label && (
          <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
            {label}
          </span>
        )}
        {description && (
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {description}
          </span>
        )}
      </div>
      <button
        type='button'
        className={`focus:ring-primary-500 relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeClasses[size]} ${checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
        role='switch'
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={` ${thumbSizeClasses[size]} ${translateClasses[size]} pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  )
}

export default ToggleSwitch
