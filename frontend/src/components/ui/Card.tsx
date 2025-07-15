import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
    children: React.ReactNode
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
}

export function Card({
    children,
    className,
    padding = 'md',
    hover = false,
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }

    return (
        <div
            className={clsx(
                'bg-white rounded-lg border border-gray-200 shadow-sm',
                paddingClasses[padding],
                hover && 'hover:shadow-md transition-shadow duration-200',
                className
            )}
        >
            {children}
        </div>
    )
}
