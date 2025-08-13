import React from 'react'
import { motion } from 'framer-motion'

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

  const marginSizeClasses = {
    sm: 'mt-0',
    md: 'mt-0',
    lg: 'mt-[2px]',
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className='flex flex-1 flex-col pr-4'>
        {label && (
          <motion.span
            className='text-sm font-medium text-gray-900 dark:text-gray-100'
            whileHover={{ x: 2 }}
          >
            {label}
          </motion.span>
        )}
        {description && (
          <motion.span
            className='text-xs text-gray-500 dark:text-gray-400'
            whileHover={{ x: 2 }}
          >
            {description}
          </motion.span>
        )}
      </div>
      <motion.button
        type='button'
        className={`focus:ring-primary-500 relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeClasses[size]} ${checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        role='switch'
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
      >
        <motion.span
          className={`${thumbSizeClasses[size]} ${marginSizeClasses[size]} pointer-events-none inline-block rounded-full bg-white shadow`}
          initial={false}
          animate={{
            x: checked ? (size === 'sm' ? 16 : size === 'md' ? 20 : 26) : 0,
          }}
          transition={{ type: 'spring', stiffness: 700, damping: 20 }}
        />
      </motion.button>
    </div>
  )
}

export default ToggleSwitch
