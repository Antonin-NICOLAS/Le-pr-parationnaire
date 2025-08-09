'use client'

import type React from 'react'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  className = '',
}) => {
  return (
    <div className='from-primary-50 to-primary-100 flex min-h-screen items-center justify-center bg-gradient-to-br via-white p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className={`w-full max-w-md ${className}`}>
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className='mb-3 flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-gray-600 hover:border-[1px] hover:px-[calc(0.5rem-1px)] hover:py-[calc(0.5rem-1px)] hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}

        <div className='rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-lg dark:border-gray-700/20 dark:bg-gray-800/80'>
          <div className='mb-8 text-center'>
            <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
              {title}
            </h1>
            {subtitle && (
              <p className='text-gray-600 dark:text-gray-400'>{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
