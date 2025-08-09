import type React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={`border-t-primary-500 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 ${sizeClasses[size]} ${className} `}
      role='status'
      aria-label='Loading'
    >
      <span className='sr-only'>Loading...</span>
    </div>
  )
}

export default LoadingSpinner
