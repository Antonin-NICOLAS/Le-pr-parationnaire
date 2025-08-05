import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        {/* Overlay */}
        <div
          className='fixed inset-0 opacity-30 bg-gray-900 transition-opacity'
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal */}
        <div
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-title'
          aria-describedby='modal-desc'
          tabIndex={-1}
          className={`
            relative w-full ${sizeClasses[size]} transform rounded-lg bg-white dark:bg-gray-800 
            shadow-xl transition-all duration-300 animate-fade-in
            ${className}
          `}
        >
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className='rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
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
