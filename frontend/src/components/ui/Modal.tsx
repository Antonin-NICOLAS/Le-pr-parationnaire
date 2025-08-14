import type React from 'react'
import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useUrlModal } from '../../routes/UseUrlModal'

interface ModalProps {
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  urlName?: string
  isOpen?: boolean
  onClose?: () => void
}

const Modal: React.FC<ModalProps> = ({
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  urlName,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const urlModal = urlName ? useUrlModal(urlName) : null
  const isOpen = urlName ? urlModal!.isOpen : (controlledIsOpen ?? false)
  const onClose = urlName ? urlModal!.close : (controlledOnClose ?? (() => {}))

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex min-h-screen items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
              onClick={closeOnOverlayClick ? handleClose : undefined}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              role='dialog'
              aria-modal='true'
              aria-labelledby='modal-title'
              aria-describedby='modal-desc'
              className={clsx(
                `relative w-full ${sizeClasses[size]} mt-[4.25rem] max-h-[85vh] transform overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700`,
                className,
              )}
            >
              <div className='sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 py-4 dark:border-gray-700 dark:bg-gray-800/95 shadow-sm'>
                <h3
                  className='text-lg font-semibold text-gray-900 dark:text-gray-100'
                  id='modal-title'
                >
                  {title}
                </h3>
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className='cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors'
                  >
                    <X size={20} />
                  </motion.button>
                )}
              </div>

              <div className='overflow-y-auto px-6 py-6 max-h-[calc(85vh-80px)]'>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
