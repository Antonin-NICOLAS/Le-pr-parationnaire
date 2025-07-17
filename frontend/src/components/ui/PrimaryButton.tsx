import type React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'

interface PrimaryButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    icon?: LucideIcon
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    children,
    loading = false,
    disabled = false,
    icon: Icon,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-lg transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-60 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
    }

    const variantClasses = {
        primary: `
      bg-primary-500 text-white 
      hover:bg-primary-600 focus:ring-primary-500 
      active:bg-primary-700 shadow-md hover:shadow-lg
    `,
        secondary: `
      bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
      hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500
    `,
        outline: `
      border-2 border-primary-500 text-primary-600 dark:text-primary-400 
      hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500
    `,
        ghost: `
      text-primary-600 dark:text-primary-400 
      hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500
    `,
    }

    return (
        <button
            disabled={disabled || loading}
            className={` ${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${loading ? 'cursor-wait' : ''} ${className} `}
            {...props}
        >
            {loading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : Icon ? (
                <Icon size={18} />
            ) : null}
            {children}
        </button>
    )
}

export default PrimaryButton
