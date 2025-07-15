import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Articles } from './pages/Articles'
import { ArticleDetail } from './pages/ArticleDetail'
import { Resources } from './pages/Resources'
import { RevisionSheets } from './pages/RevisionSheets'
import { Support } from './pages/Support'
import { Subscription } from './pages/Subscription'
import { Profile } from './pages/Profile'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm'

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('theme') as
            | 'light'
            | 'dark'
            | null
        const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
        ).matches

        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
        setTheme(initialTheme)

        // Apply theme to document
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return (
        <Router>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
                <Navbar theme={theme} toggleTheme={toggleTheme} />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/articles" element={<Articles />} />
                        <Route
                            path="/articles/:slug"
                            element={<ArticleDetail />}
                        />
                        <Route path="/resources" element={<Resources />} />
                        <Route
                            path="/revision-sheets"
                            element={<RevisionSheets />}
                        />
                        <Route path="/support" element={<Support />} />
                        <Route
                            path="/subscription"
                            element={<Subscription />}
                        />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPasswordForm />}
                        />

                        {/* Placeholder routes - à implémenter plus tard */}
                        <Route
                            path="/admin"
                            element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-2xl">
                                        Admin - À venir
                                    </h1>
                                </div>
                            }
                        />
                        <Route
                            path="/verify-email"
                            element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-2xl">
                                        Vérification email - À venir
                                    </h1>
                                </div>
                            }
                        />
                        <Route
                            path="/privacy"
                            element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-2xl">
                                        Confidentialité - À venir
                                    </h1>
                                </div>
                            }
                        />
                        <Route
                            path="/terms"
                            element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-2xl">
                                        Conditions - À venir
                                    </h1>
                                </div>
                            }
                        />
                        <Route
                            path="/about"
                            element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-2xl">
                                        À propos - À venir
                                    </h1>
                                </div>
                            }
                        />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    )
}

export default App
