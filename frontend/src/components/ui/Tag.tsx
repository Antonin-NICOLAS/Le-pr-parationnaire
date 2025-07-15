import React from 'react'
import { clsx } from 'clsx'

interface TagProps {
    children: React.ReactNode
    color?: string
    size?: 'sm' | 'md'
    className?: string
}

export function Tag({
    children,
    color = 'blue',
    size = 'sm',
    className,
}: TagProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        purple: 'bg-purple-100 text-purple-800',
        indigo: 'bg-indigo-100 text-indigo-800',
        pink: 'bg-pink-100 text-pink-800',
        gray: 'bg-gray-100 text-gray-800',
    }

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
    }

    return (
        <span
            className={clsx(
                'inline-flex items-center font-medium rounded-full',
                colorClasses[color as keyof typeof colorClasses] ||
                    colorClasses.blue,
                sizeClasses[size],
                className
            )}
        >
            {children}
        </span>
    )
}
