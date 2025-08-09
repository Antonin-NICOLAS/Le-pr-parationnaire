import React from 'react'

interface SettingsCardProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'danger' | 'warning'
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    danger:
      'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30',
  }

  const titleVariantClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    danger: 'text-red-900 dark:text-red-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
  }

  const iconVariantClasses = {
    default: 'text-gray-500 dark:text-gray-400',
    danger: 'text-red-500 dark:text-red-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
  }

  return (
    <div
      className={`rounded-lg border p-6 transition-all duration-200 hover:shadow-md ${variantClasses[variant]} ${className} `}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          {Icon && (
            <div className='flex-shrink-0'>
              <Icon size={24} className={iconVariantClasses[variant]} />
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <h3
              className={`text-lg font-semibold ${titleVariantClasses[variant]}`}
            >
              {title}
            </h3>
            {description && (
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className='mt-4'>{children}</div>
    </div>
  )
}

export default SettingsCard
