import React, { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
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
  // Gestion ouverture via URL
  const urlModal = urlName ? useUrlModal(urlName) : null

  // On choisit la source (URL ou props)
  const isOpen = urlName ? urlModal!.isOpen : (controlledIsOpen ?? false)
  const onClose = urlName ? urlModal!.close : (controlledOnClose ?? (() => {}))

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
      setTimeout(() => setIsMounted(false), 200)
    }
  }, [isOpen])

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  if (!isMounted) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        {/* Overlay */}
        <div
          className={clsx(
            'fixed inset-0 bg-gray-900 transition-opacity duration-200',
            {
              'opacity-30': isVisible,
              'opacity-0': !isVisible,
            },
          )}
          onClick={closeOnOverlayClick ? handleClose : undefined}
        />

        {/* Modal */}
        <div
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-title'
          aria-describedby='modal-desc'
          className={clsx(
            `relative w-full ${sizeClasses[size]} mt-[4.25rem] max-h-[80vh] transform overflow-y-auto rounded-lg bg-white shadow-xl transition-all duration-200 dark:bg-gray-800`,
            {
              'scale-100 opacity-100': isVisible,
              'scale-95 opacity-0': !isVisible,
            },
            className,
          )}
        >
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
            <h3
              className='text-lg font-semibold text-gray-900 dark:text-gray-100'
              id='modal-title'
            >
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className='cursor-pointer rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className='px-6 py-4'>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
