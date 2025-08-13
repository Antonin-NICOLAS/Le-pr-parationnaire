import { useState } from 'react'
import { RefreshCw, type LucideIcon } from 'lucide-react'
import PrimaryButton from './PrimaryButton'
import CountdownTimer from './CountdownTimer'
import { motion, AnimatePresence } from 'framer-motion'

interface ResendSectionProps {
  message?: string
  countdownSeconds?: number
  onResend: () => void
  loading?: boolean
  variant?: 'inline' | 'block'
  icon?: LucideIcon
  buttonText?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export default function ResendSection({
  message = "Didn't receive the email?",
  countdownSeconds = 60,
  onResend,
  loading = false,
  variant = 'block',
  icon: Icon = RefreshCw,
  buttonText = 'Resend Code',
  align = 'center',
  className = '',
}: ResendSectionProps) {
  const [canResend, setCanResend] = useState(false)

  return (
    <div className={`space-y-3 text-${align} ${className}`}>
      {variant === 'block' && (
        <p className='text-sm text-gray-600 dark:text-gray-400'>{message}</p>
      )}

      <AnimatePresence mode='wait'>
        {!canResend ? (
          <motion.div
            key='countdown'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={variant === 'inline' ? 'flex items-center gap-2' : ''}
          >
            <CountdownTimer
              initialSeconds={countdownSeconds}
              onComplete={() => setCanResend(true)}
              className={align === 'center' ? 'justify-center' : ''}
            />
          </motion.div>
        ) : (
          <motion.div
            key='button'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {variant === 'inline' ? (
              <PrimaryButton
                variant='ghost'
                onClick={onResend}
                loading={loading}
                disabled={!canResend || loading}
                icon={Icon}
              >
                {buttonText}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                variant='ghost'
                onClick={onResend}
                loading={loading}
                disabled={!canResend || loading}
                icon={Icon}
                className='mt-2'
              >
                {buttonText}
              </PrimaryButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
