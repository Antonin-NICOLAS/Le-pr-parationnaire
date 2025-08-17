import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher des articles...',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className='relative'>
        <motion.div
          className={`
            flex items-center rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 dark:bg-gray-800/80
            ${
              isFocused
                ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileFocus={{ scale: 1.02 }}
        >
          <motion.div
            className='pl-4'
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? 'rgb(84, 140, 169)' : 'rgb(107, 114, 128)',
            }}
            transition={{ duration: 0.2 }}
          >
            <Search size={20} />
          </motion.div>

          <input
            ref={inputRef}
            type='text'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className='flex-1 bg-transparent px-4 py-3 text-gray-900 placeholder-gray-500 outline-none dark:text-gray-100 dark:placeholder-gray-400'
          />

          <AnimatePresence>
            {value && (
              <motion.button
                onClick={handleClear}
                className='mr-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          {!isFocused && !value && (
            <motion.div
              className='mr-4 hidden items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400 md:flex'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span>⌘</span>
              <span>K</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Search suggestions could go here */}
      <AnimatePresence>
        {isFocused && value && (
          <motion.div
            className='absolute top-full z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className='p-3 text-center text-sm text-gray-500 dark:text-gray-400'>
              Recherche en cours...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default SearchBar
