import type React from 'react'
import { Star } from 'lucide-react'

interface StatusBadgeProps {
  isEnabled: boolean
  isPreferred?: boolean
  onSetPreferred?: () => void
  preferredLoading?: boolean
  preferredText?: string
  enabledText?: string
  disabledText?: string
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  isEnabled,
  isPreferred = false,
  onSetPreferred,
  preferredLoading = false,
  preferredText = 'Méthode préférée',
  enabledText = 'Activé',
  disabledText = 'Désactivé',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col space-y-2 min-[320px]:space-y-0 min-[320px]:flex-row items-center min-[320px]:justify-between ${className}`}
    >
      <span
        className={`rounded-full px-2 py-1 text-xs ${
          isEnabled
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {isEnabled ? enabledText : disabledText}
      </span>

      {isEnabled && onSetPreferred && (
        <button
          className={`flex items-center rounded-full px-2 py-1 text-xs transition-colors ${
            isPreferred
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          disabled={preferredLoading || isPreferred}
          onClick={!isPreferred ? onSetPreferred : undefined}
        >
          <Star className='mr-1 h-4 w-4' />
          {isPreferred ? preferredText : 'Choisir comme préférée'}
        </button>
      )}
    </div>
  )
}

export default StatusBadge
