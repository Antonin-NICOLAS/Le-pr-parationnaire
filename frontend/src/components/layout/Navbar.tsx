import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, BookOpen, Sun, Moon } from 'lucide-react'
import { Button } from '../ui/Button'
import { UserAvatar } from '../ui/UserAvatar'
import { useAuth } from '../../hooks/useAuth'

interface NavbarProps {
    theme: 'light' | 'dark'
    toggleTheme: () => void
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, signOut } = useAuth()
    const location = useLocation()

    const navigation = [
        { name: 'Accueil', href: '/' },
        { name: 'Articles', href: '/articles' },
        { name: 'Ressources', href: '/resources' },
        { name: 'Fiches', href: '/revision-sheets' },
        { name: 'Soutenir', href: '/support' },
    ]

    const isActive = (href: string) => {
        return location.pathname === href
    }

    const handleSignOut = async () => {
        await signOut()
        setIsMenuOpen(false)
    }

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Le Préparationnaire
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive(item.href)
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            {theme === 'light' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/profile">
                                    <UserAvatar
                                        src={user.user_metadata?.avatar_url}
                                    />
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSignOut}
                                >
                                    Déconnexion
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        Connexion
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Inscription</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block px-3 py-2 text-base font-medium transition-colors ${
                                    isActive(item.href)
                                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
                            <div className="flex items-center justify-between px-3">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {theme === 'light' ? (
                                        <Moon size={20} />
                                    ) : (
                                        <Sun size={20} />
                                    )}
                                </button>

                                {user ? (
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <UserAvatar
                                                src={
                                                    user.user_metadata
                                                        ?.avatar_url
                                                }
                                            />
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSignOut}
                                        >
                                            Déconnexion
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Button variant="ghost" size="sm">
                                                Connexion
                                            </Button>
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Button size="sm">
                                                Inscription
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
