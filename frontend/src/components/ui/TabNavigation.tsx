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
      className={`relative border-gray-200 md:border-b dark:border-gray-700 ${className}`}
    >
      {/* Version desktop/tablette (visible à partir de md) */}
      <div
        ref={navRef}
        className='scrollbar-hide hidden overflow-x-auto pb-1 md:block'
      >
        <nav className='-mb-px flex space-x-4 lg:space-x-8'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group inline-flex cursor-pointer items-center whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } `}
                aria-current={isActive ? 'page' : undefined}
              >
                {Icon && (
                  <Icon
                    size={20}
                    className={`-ml-0.5 mr-2 ${
                      isActive
                        ? 'text-primary-500 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    } `}
                  />
                )}
                <span className='hidden sm:inline'>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300'
                    } `}
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
      <div className='relative md:hidden' ref={dropdownRef}>
        <button
          className='flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-800'
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
                <span className='bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 ml-2 rounded-full px-2.5 py-0.5 text-xs'>
                  {activeTabData.count}
                </span>
              )}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 transform text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className='absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
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
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  } `}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      className={`mr-2 ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400'} `}
                    />
                  )}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      } `}
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
        <div className='pointer-events-none absolute bottom-0 right-0 top-0 hidden w-8 bg-gradient-to-l from-white to-transparent md:block dark:from-gray-900' />
      )}
    </div>
  )
}

export default TabNavigation
