import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import StatusBadge from './StatusBadge'

interface TwoFactorMethodCardProps {
  icon: LucideIcon
  iconColor: 'blue' | 'yellow' | 'purple' | 'green' | 'orange' | 'red'
  title: string
  description: string
  isEnabled: boolean
  isPreferred?: boolean
  onToggle: () => void
  onSetPreferred?: () => void
  toggleLoading?: boolean
  preferredLoading?: boolean
  additionalInfo?: string
  children?: React.ReactNode
  className?: string
}

const TwoFactorMethodCard: React.FC<TwoFactorMethodCardProps> = ({
  icon: Icon,
  iconColor,
  title,
  description,
  isEnabled,
  isPreferred = false,
  onToggle,
  onSetPreferred,
  toggleLoading = false,
  preferredLoading = false,
  additionalInfo,
  children,
  className = '',
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow:
      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple:
      'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green:
      'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange:
      'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className='mb-4 flex items-center space-x-3'>
        <div className={`rounded-lg p-2 ${colorClasses[iconColor]}`}>
          <Icon size={20} />
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
              {title}
            </h4>
            {additionalInfo && (
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {additionalInfo}
              </span>
            )}
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {description}
          </p>
        </div>
      </div>

      <StatusBadge
        isEnabled={isEnabled}
        isPreferred={isPreferred}
        onSetPreferred={onSetPreferred}
        preferredLoading={preferredLoading}
        className='mb-4'
      />

      <div className='space-y-2'>
        <PrimaryButton
          variant={isEnabled ? 'secondary' : 'primary'}
          size='sm'
          fullWidth
          onClick={onToggle}
          loading={toggleLoading}
        >
          {isEnabled ? 'Désactiver' : 'Activer'}
        </PrimaryButton>

        {children}
      </div>
    </div>
  )
}

export default TwoFactorMethodCard
