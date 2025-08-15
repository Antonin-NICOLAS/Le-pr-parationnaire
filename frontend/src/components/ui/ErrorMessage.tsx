import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Info, CheckCircle } from 'lucide-react'
import type React from 'react'
import { useRef, useEffect, useState } from 'react'

interface ErrorMessageProps {
  title?: string
  message: React.ReactNode
  type?: 'error' | 'warning' | 'info' | 'success'
  onClose?: () => void
  className?: string
  isVisible?: boolean
  /** Durée en ms avant auto-fermeture (0 = désactivé) */
  autoCloseDelay?: number
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = 'error',
  onClose,
  className = '',
  isVisible = true,
  autoCloseDelay = 0,
}) => {
  const [internalVisible, setInternalVisible] = useState(isVisible)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInternalVisible(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (autoCloseDelay > 0 && internalVisible && onClose) {
      const timer = setTimeout(() => {
        setInternalVisible(false)
        onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoCloseDelay, internalVisible, onClose])

  const configs = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-100',
      iconColor: 'text-red-500 dark:text-red-400',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-100',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-100',
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-100',
      iconColor: 'text-green-500 dark:text-green-400',
    },
  }

  const config = configs[type]
  const IconComponent = config.icon

  const containerVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 1, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <AnimatePresence>
      {internalVisible && (
        <motion.div
          ref={containerRef}
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={containerVariants}
          className={`error-message-container ${className}`}
          style={{
            display: 'inline-block',
            textAlign: 'left',
            width: '100%',
            maxWidth: 'min(100%, 500px)',
          }}
        >
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-xs dark:shadow-none ${config.bgColor} ${config.borderColor}`}
            style={{
              margin: 0,
              fontFamily: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
            }}
          >
            {/* Icône - toujours présente */}
            <div
              className='flex-shrink-0'
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
              }}
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <IconComponent
                  size={20}
                  className={config.iconColor}
                  style={{
                    display: 'block',
                  }}
                />
              </motion.div>
            </div>

            <div
              className='flex-1 min-w-0'
              style={{
                flexShrink: 1,
                overflow: 'hidden',
              }}
            >
              {title && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`font-semibold mb-1 break-words ${config.textColor}`}
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: '1.25rem',
                  }}
                >
                  {title}
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: title ? 0.2 : 0.15 }}
                className={`text-sm break-words ${config.textColor}`}
                style={{
                  lineHeight: '1.25rem',
                }}
              >
                {message}
              </motion.div>
            </div>

            {onClose && (
              <div
                className='flex-shrink-0'
                style={{
                  marginTop: '-2px',
                  marginRight: '-4px',
                }}
              >
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`rounded p-1 hover:bg-black/10 dark:hover:bg-white/10 ${config.textColor}`}
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 100ms',
                  }}
                  aria-label='Close message'
                >
                  <X size={16} />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ErrorMessage
