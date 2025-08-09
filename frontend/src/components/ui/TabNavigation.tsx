import React, { useState, useRef, useEffect } from 'react'
import { useWindowSize } from '@react-hook/window-size'
import { ChevronDown } from 'lucide-react'

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
  const [windowWidth] = useWindowSize()
  const [overflowing, setOverflowing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Détecter si les onglets débordent du conteneur
  useEffect(() => {
    if (navRef.current) {
      const { scrollWidth, clientWidth } = navRef.current
      setOverflowing(scrollWidth > clientWidth)
    }
  }, [tabs, windowWidth])

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Trouver l'onglet actif pour le dropdown
  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  return (
    <div
      className={`relative md:border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Version desktop/tablette (visible à partir de md) */}
      <div
        ref={navRef}
        className='hidden md:block overflow-x-auto pb-1 scrollbar-hide'
      >
        <nav className='flex space-x-4 lg:space-x-8 -mb-px'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap cursor-pointer
                  ${
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {Icon && (
                  <Icon
                    size={20}
                    className={`
                      -ml-0.5 mr-2
                      ${
                        isActive
                          ? 'text-primary-500 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }
                    `}
                  />
                )}
                <span className='hidden sm:inline'>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`
                      ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                      ${
                        isActive
                          ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Version mobile/téléphone (visible en dessous de md) */}
      <div className='md:hidden relative' ref={dropdownRef}>
        <button
          className='w-full flex items-center justify-between py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800'
          onClick={() => setDropdownOpen(!dropdownOpen)}
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
                <span className='ml-2 py-0.5 px-2.5 rounded-full text-xs bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'>
                  {activeTabData.count}
                </span>
              )}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className='absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id)
                    setDropdownOpen(false)
                  }}
                  className={`
                    w-full flex items-center px-4 py-2 text-left text-sm
                    ${
                      isActive
                        ? 'bg-gray-100 text-primary-600 dark:bg-gray-700 dark:text-primary-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className={`
                        mr-2
                        ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400'}
                      `}
                    />
                  )}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`
                        ml-auto py-0.5 px-2 rounded-full text-xs
                        ${
                          isActive
                            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Indicateur visuel pour le défilement */}
      {overflowing && (
        <div className='hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-900 pointer-events-none' />
      )}
    </div>
  )
}

export default TabNavigation
