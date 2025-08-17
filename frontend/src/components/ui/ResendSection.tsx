import { useState } from 'react'
import { RefreshCw, type LucideIcon } from 'lucide-react'
import PrimaryButton from './PrimaryButton'
import CountdownTimer from './CountdownTimer'
import { motion, AnimatePresence } from 'framer-motion'

interface ResendSectionProps {
  message?: string
  countdownSeconds?: number
  onResend: () => Promise<void> | void
  loading?: boolean
  variant?: 'inline' | 'block'
  icon?: LucideIcon
  buttonText?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export default function ResendSection({
  message = "Vous n'avez pas reçu l'email ? Vérifiez votre dossier Indésirables ou",
  countdownSeconds = 60,
  onResend,
  loading = false,
  variant = 'block',
  icon: Icon = RefreshCw,
  buttonText = 'Renvoyer le code',
  align = 'center',
  className = '',
}: ResendSectionProps) {
  const [canResend, setCanResend] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResend = async () => {
    try {
      await onResend()
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 2000) // Success message duration
      setCanResend(false)
    } catch (error) {
      // Error handling would go here
    }
  }

  return (
    <div
      className={`space-y-3 flex flex-col ${align === 'center' && 'items-center justify-center'} text-${align} ${className}`}
    >
      {variant === 'block' && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='text-sm text-gray-600 dark:text-gray-400'
        >
          {message}
        </motion.p>
      )}

      <AnimatePresence mode='wait'>
        {resendSuccess ? (
          <motion.div
            key='success'
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 500,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            className='text-green-600 dark:text-green-400 text-sm'
          >
            Verification code sent successfully!
          </motion.div>
        ) : !canResend ? (
          <motion.div
            key='countdown'
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: { duration: 0.2 },
            }}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 15,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.15 },
            }}
          >
            {variant === 'inline' ? (
              <PrimaryButton
                variant='ghost'
                onClick={handleResend}
                loading={loading}
                disabled={!canResend || loading}
                icon={Icon}
              >
                <motion.span
                  animate={{
                    scale: [1, 1.05, 1], // Pulse effect
                    transition: {
                      repeat: Infinity,
                      duration: 1.5,
                      repeatDelay: 2,
                    },
                  }}
                >
                  {buttonText}
                </motion.span>
                {loading && (
                  <motion.span
                    animate={{
                      rotate: 360,
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                    }}
                    className='ml-2'
                  >
                    <Icon className='h-4 w-4' />
                  </motion.span>
                )}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                variant='ghost'
                onClick={handleResend}
                disabled={!canResend || loading}
                icon={!loading ? Icon : undefined}
                className='mt-2'
              >
                {loading && (
                  <motion.span
                    animate={{
                      rotate: 360,
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                    }}
                    className='ml-2'
                  >
                    <Icon className='h-4 w-4' />
                  </motion.span>
                )}
                <motion.span
                  animate={{
                    scale: [1, 1.05, 1], // Pulse effect
                    transition: {
                      repeat: Infinity,
                      duration: 1.5,
                      repeatDelay: 2,
                    },
                  }}
                >
                  {buttonText}
                </motion.span>
              </PrimaryButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator during countdown */}
      <AnimatePresence>
        {!canResend && !resendSuccess && (
          <div className='w-[50%] min-w-[250px] bg-gray-300 dark:bg-gray-500 rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: '100%',
                transition: {
                  duration: countdownSeconds,
                  ease: 'linear',
                },
              }}
              exit={{ opacity: 0 }}
              className='h-2 bg-primary-400 dark:bg-primary-700 rounded-full overflow-hidden'
            ></motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
