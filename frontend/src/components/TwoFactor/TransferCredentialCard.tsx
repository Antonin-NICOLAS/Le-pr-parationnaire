import type React from 'react'
import { motion } from 'framer-motion'
import { Key, Check } from 'lucide-react'
import type { WebAuthnCredential } from '../../types/user'

interface TransferCredentialCardProps {
  credential: WebAuthnCredential
  isSelected: boolean
  onSelect: (credentialId: string) => void
  disabled?: boolean
}

const TransferCredentialCard: React.FC<TransferCredentialCardProps> = ({
  credential,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  return (
    <motion.label
      className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <input
        type='checkbox'
        checked={isSelected}
        onChange={() => !disabled && onSelect(credential.id)}
        disabled={disabled}
        className='sr-only'
      />

      {/* Custom checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
          isSelected
            ? 'bg-primary-500 border-primary-500'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {isSelected && <Check className='w-3 h-3 text-white' />}
      </div>

      <div className='flex items-center space-x-3 flex-1'>
        <div className='rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20'>
          <Key className='h-5 w-5 text-purple-600 dark:text-purple-400' />
        </div>
        <div className='flex-1'>
          <div className='font-medium text-gray-900 dark:text-gray-100'>
            {credential.deviceName}
          </div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {credential.deviceType} • Dernière utilisation:{' '}
            {new Date(credential.lastUsed || '').toLocaleDateString() ||
              'Jamais'}
          </div>
        </div>
      </div>
    </motion.label>
  )
}

export default TransferCredentialCard
