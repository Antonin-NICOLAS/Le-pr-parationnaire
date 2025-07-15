import { User } from 'lucide-react'
import { clsx } from 'clsx'

interface UserAvatarProps {
    src?: string
    alt?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function UserAvatar({
    src,
    alt = 'User avatar',
    size = 'md',
    className,
}: UserAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    }

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
    }

    return (
        <div
            className={clsx(
                'rounded-full bg-gray-200 flex items-center justify-center overflow-hidden',
                sizeClasses[size],
                className
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <User size={iconSizes[size]} className="text-gray-500" />
            )}
        </div>
    )
}
