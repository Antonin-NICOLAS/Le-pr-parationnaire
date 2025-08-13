import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tab {
  id: string
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  count?: number
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const [overflowing, setOverflowing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Measure and observe
  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current
      const measure = measureRef.current
      if (!wrapper || !measure) return

      measure.style.width = `${wrapper.clientWidth}px`

      requestAnimationFrame(() => {
        const { scrollWidth, clientWidth } = measure
        setOverflowing(scrollWidth > clientWidth)
      })
    }

    update()

    const ro = new ResizeObserver(update)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', update)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [tabs])

  useEffect(() => {
    if (!overflowing) setDropdownOpen(false)
  }, [overflowing])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeTabData = tabs.find((t) => t.id === activeTab)

  return (
    <div
      ref={wrapperRef}
      className={`relative border-gray-200 ${!overflowing && 'border-b'} dark:border-gray-700 ${className}`}
    >
      <div
        ref={measureRef}
        aria-hidden='true'
        className='pointer-events-none absolute -left-[9999px] top-0 opacity-0'
        style={{ position: 'absolute' }}
      >
        <nav className='-mb-px flex space-x-4 lg:space-x-8'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <div
                key={tab.id}
                className='inline-flex items-center whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium'
              >
                {Icon && <Icon size={20} className='-ml-0.5 mr-2' />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className='ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium'>
                    {tab.count}
                  </span>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Normal tab view */}
      {!overflowing && (
        <div className='scrollbar-hide overflow-x-auto pb-1'>
          <nav className='-mb-px flex space-x-4 lg:space-x-8'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`group relative inline-flex cursor-pointer items-center whitespace-nowrap border-transparent border-b-2 px-1 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId='tabIndicator'
                      className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500'
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                  )}
                  {Icon && (
                    <Icon
                      size={20}
                      className={`-ml-0.5 mr-2 transition-colors ${
                        isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}
                    />
                  )}
                  <motion.span
                    layout='position'
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {tab.label}
                  </motion.span>
                  {tab.count !== undefined && (
                    <motion.span
                      className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isActive
                          ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-700/50 dark:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {tab.count}
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Dropdown view */}
      {overflowing && (
        <div className='relative' ref={dropdownRef}>
          <motion.button
            className='flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-800'
            onClick={() => setDropdownOpen((s) => !s)}
            type='button'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className='flex items-center'>
              {activeTabData?.icon && (
                <activeTabData.icon
                  size={20}
                  className='text-primary-500 dark:text-primary-400 mr-2'
                />
              )}
              <span className='font-medium text-gray-900 dark:text-white'>
                {activeTabData?.label}
                {activeTabData?.count !== undefined && (
                  <span className='bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 ml-2 rounded-full px-2.5 py-0.5 text-xs'>
                    {activeTabData.count}
                  </span>
                )}
              </span>
            </div>
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className='h-5 w-5 text-gray-400' />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                key='dropdown'
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: 'auto',
                  transition: {
                    opacity: { duration: 0.15 },
                    y: { type: 'spring', stiffness: 300, damping: 25 },
                    height: { duration: 0.2 },
                  },
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  height: 0,
                  transition: {
                    opacity: { duration: 0.1 },
                    height: { duration: 0.15 },
                  },
                }}
                className='absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id)
                        setDropdownOpen(false)
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      whileHover={{ x: 2 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {Icon && (
                        <Icon
                          size={18}
                          className={`mr-2 ${
                            isActive ? 'text-primary-500' : 'text-gray-400'
                          }`}
                        />
                      )}
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <motion.span
                          className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                            isActive
                              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {tab.count}
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Gradient fade effect */}
      {overflowing && (
        <motion.div
          className='pointer-events-none absolute bottom-0 right-0 top-0 hidden w-8 bg-gradient-to-l from-white to-transparent md:block dark:from-gray-900'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  )
}

export default TabNavigation
