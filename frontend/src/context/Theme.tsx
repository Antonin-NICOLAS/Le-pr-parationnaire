import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useAuth } from './Auth'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  setTemporaryTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const getSystemTheme = (): Theme => {
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [theme, setTheme] = useState<Theme>('light')
  const [isTemporaryOverride, setIsTemporaryOverride] = useState(false)

  // Appliquer ou retirer la classe CSS
  const applyThemeClass = (themeToApply: Theme) => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(themeToApply)
  }

  // Gère les changements de thème système (ex: macOS passe en dark à la tombée de la nuit)
  useEffect(() => {
    if (user?.theme !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!isTemporaryOverride) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        applyThemeClass(newTheme)
      }
    }

    media.addEventListener('change', handleSystemChange)
    return () => media.removeEventListener('change', handleSystemChange)
  }, [user?.theme, isTemporaryOverride])

  // Initialisation du thème
  useEffect(() => {
    if (user) {
      if (user.theme === 'auto') {
        const systemTheme = getSystemTheme()
        setTheme(systemTheme)
        applyThemeClass(systemTheme)
      } else {
        setTheme(user.theme as Theme)
        applyThemeClass(user.theme as Theme)
      }
    } else {
      const local = localStorage.getItem('theme') as Theme | null
      const localTheme: Theme =
        local === 'dark'
          ? 'dark'
          : local === 'light'
            ? 'light'
            : getSystemTheme()
      setTheme(localTheme)
      applyThemeClass(localTheme)
    }
  }, [user])

  // Toggle manuel (sidebar)
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyThemeClass(newTheme)
    setIsTemporaryOverride(true)

    if (!user) {
      localStorage.setItem('theme', newTheme)
    }
  }, [theme, user])

  // Permet de forcer un thème temporaire (ex: bouton)
  const setTemporaryTheme = (selectedTheme: Theme) => {
    setTheme(selectedTheme)
    applyThemeClass(selectedTheme)
    setIsTemporaryOverride(true)

    if (!user) {
      localStorage.setItem('theme', selectedTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTemporaryTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
