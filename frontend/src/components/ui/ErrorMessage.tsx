import type React from 'react'
import { AlertCircle, X, Info, CheckCircle } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
  onClose?: () => void
  className?: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = 'error',
  onClose,
  className = '',
}) => {
  const configs = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-500',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-500',
    },
  }

  const config = configs[type]
  const IconComponent = config.icon

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${config.bgColor} ${config.borderColor} animate-slide-in ${className} `}
      role='alert'
    >
      <IconComponent
        size={20}
        className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}
      />
      <div className='flex flex-col'>
        {' '}
        {title && (
          <div
            className={`flex-1 text-md font-semibold mb-1 ${config.textColor}`}
          >
            {title}
          </div>
        )}
        <div className={`flex-1 text-sm ${config.textColor}`}>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 rounded p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10 ${config.textColor}`}
          aria-label='Close message'
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
