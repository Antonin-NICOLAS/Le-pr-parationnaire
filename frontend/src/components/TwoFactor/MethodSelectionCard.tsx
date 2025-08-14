import type React from 'react'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MethodSelectionCardProps {
  method: string
  icon: LucideIcon
  title: string
  description: string
  color: 'blue' | 'yellow' | 'purple' | 'green' | 'orange' | 'red'
  isSelected?: boolean
  onClick: () => void
  disabled?: boolean
  layout?: 'horizontal' | 'vertical'
  showChevron?: boolean
  className?: string
}

const MethodSelectionCard: React.FC<MethodSelectionCardProps> = ({
  method,
  icon: Icon,
  title,
  description,
  color,
  isSelected = false,
  onClick,
  disabled = false,
  layout = 'horizontal',
  showChevron = true,
  className = '',
}) => {
  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    yellow: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    orange: {
      border: 'border-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    red: {
      border: 'border-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.button
      whileHover={!disabled ? { y: -2, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        w-full rounded-xl border-2 p-4 text-left transition-all
        ${
          isSelected
            ? `${colors.border} ${colors.bg}`
            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${layout === 'vertical' ? 'text-center' : ''}
        ${className}
      `}
    >
      <div
        className={`flex items-center ${layout === 'vertical' ? 'flex-col' : ''} space-x-3 ${layout === 'vertical' ? 'space-x-0 space-y-2' : ''}`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.iconBg} ${layout === 'vertical' ? 'mb-2' : ''}`}
        >
          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
        </div>
        <div className={`flex-1 ${layout === 'vertical' ? 'text-center' : ''}`}>
          <div className='font-medium text-gray-900 dark:text-gray-100'>
            {title}
          </div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {description}
          </div>
        </div>
        {showChevron && layout === 'horizontal' && (
          <ChevronRight className='ml-auto h-5 w-5 text-gray-400' />
        )}
      </div>
    </motion.button>
  )
}

export default MethodSelectionCard
