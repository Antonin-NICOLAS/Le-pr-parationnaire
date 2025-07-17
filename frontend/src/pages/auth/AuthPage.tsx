'use client'

import type React from 'react'
import { useState } from 'react'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import CustomInput from '../../components/ui/CustomInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import type {
    RegisterData,
    LoginCredentials,
    PasswordStrength,
} from '../../types/auth'

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    // Login state
    const [loginData, setLoginData] = useState<LoginCredentials>({
        email: '',
        password: '',
        rememberMe: false,
    })

    // Register state
    const [registerData, setRegisterData] = useState<RegisterData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        rememberMe: false,
    })

    const [passwordStrength, setPasswordStrength] =
        useState<PasswordStrength | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!loginData.email || !loginData.password) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Check if email exists and has 2FA/WebAuthn
            // This would normally be an API call
            const mockUser = {
                email: loginData.email,
                hasWebAuthn: loginData.email === 'user@example.com',
                has2FA: loginData.email === 'admin@example.com',
                preferredMethod: 'email' as const,
            }

            if (mockUser.hasWebAuthn) {
                // Navigate to WebAuthn flow
                toast.success('WebAuthn available')
            } else if (mockUser.has2FA) {
                // Navigate to 2FA verification
                toast.success('Redirecting to 2FA verification')
            } else {
                toast.success('Login successful!')
            }
        } catch (error) {
            toast.error('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (
            !registerData.firstName ||
            !registerData.lastName ||
            !registerData.email ||
            !registerData.password
        ) {
            toast.error('Please fill in all fields')
            return
        }

        if (registerData.password !== registerData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (!registerData.acceptTerms) {
            toast.error('Please accept the terms of service')
            return
        }

        if (passwordStrength && passwordStrength.score < 50) {
            toast.error('Please choose a stronger password')
            return
        }

        setIsLoading(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))

            toast.success(
                'Registration successful! Please check your email for verification.'
            )
            // Navigate to email verification page
        } catch (error) {
            toast.error('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="from-primary-50 to-primary-100 flex min-h-screen items-center justify-center bg-gradient-to-br via-white p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="w-full max-w-md">
                <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-800/90">
                    {/* Header */}
                    <div className="p-8 pb-4">
                        <div className="text-center">
                            <h1 className="from-primary-600 to-primary-800 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
                                {isLogin ? 'Welcome Back' : 'Join Us'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {isLogin
                                    ? 'Sign in to your account'
                                    : 'Create your account'}
                            </p>
                        </div>
                    </div>

                    {/* Form Toggle */}
                    <div className="mb-6 px-8">
                        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                    isLogin
                                        ? 'bg-white text-gray-900 shadow-md dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                    !isLogin
                                        ? 'bg-white text-gray-900 shadow-md dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="px-8 pb-8">
                        {isLogin ? (
                            <form
                                onSubmit={handleLogin}
                                className="animate-fade-in space-y-6"
                            >
                                <CustomInput
                                    type="email"
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    value={loginData.email}
                                    onChange={(e) =>
                                        setLoginData({
                                            ...loginData,
                                            email: e.target.value,
                                        })
                                    }
                                    icon={Mail}
                                    required
                                    autoComplete="email"
                                />

                                <CustomInput
                                    type="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={(e) =>
                                        setLoginData({
                                            ...loginData,
                                            password: e.target.value,
                                        })
                                    }
                                    icon={Lock}
                                    required
                                    autoComplete="current-password"
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={loginData.rememberMe}
                                            onChange={(e) =>
                                                setLoginData({
                                                    ...loginData,
                                                    rememberMe:
                                                        e.target.checked,
                                                })
                                            }
                                            className="text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                                        />
                                        Remember me
                                    </label>
                                    <button
                                        type="button"
                                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <PrimaryButton
                                    type="submit"
                                    loading={isLoading}
                                    fullWidth
                                    size="lg"
                                    icon={ArrowRight}
                                >
                                    Sign In
                                </PrimaryButton>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleRegister}
                                className="animate-fade-in space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        type="text"
                                        label="First Name"
                                        placeholder="John"
                                        value={registerData.firstName}
                                        onChange={(e) =>
                                            setRegisterData({
                                                ...registerData,
                                                firstName: e.target.value,
                                            })
                                        }
                                        icon={User}
                                        required
                                        autoComplete="given-name"
                                    />
                                    <CustomInput
                                        type="text"
                                        label="Last Name"
                                        placeholder="Doe"
                                        value={registerData.lastName}
                                        onChange={(e) =>
                                            setRegisterData({
                                                ...registerData,
                                                lastName: e.target.value,
                                            })
                                        }
                                        icon={User}
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>

                                <CustomInput
                                    type="email"
                                    label="Email Address"
                                    placeholder="john@example.com"
                                    value={registerData.email}
                                    onChange={(e) =>
                                        setRegisterData({
                                            ...registerData,
                                            email: e.target.value,
                                        })
                                    }
                                    icon={Mail}
                                    required
                                    autoComplete="email"
                                />

                                <CustomInput
                                    type="password"
                                    label="Password"
                                    placeholder="Create a strong password"
                                    value={registerData.password}
                                    onChange={(e) =>
                                        setRegisterData({
                                            ...registerData,
                                            password: e.target.value,
                                        })
                                    }
                                    icon={Lock}
                                    required
                                    autoComplete="new-password"
                                />

                                {registerData.password && (
                                    <PasswordStrengthMeter
                                        password={registerData.password}
                                        onStrengthChange={setPasswordStrength}
                                        className="mb-4"
                                    />
                                )}

                                <CustomInput
                                    type="password"
                                    label="Confirm Password"
                                    placeholder="Confirm your password"
                                    value={registerData.confirmPassword}
                                    onChange={(e) =>
                                        setRegisterData({
                                            ...registerData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    icon={Lock}
                                    required
                                    autoComplete="new-password"
                                />

                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={registerData.acceptTerms}
                                            onChange={(e) =>
                                                setRegisterData({
                                                    ...registerData,
                                                    acceptTerms:
                                                        e.target.checked,
                                                })
                                            }
                                            className="text-primary-600 focus:ring-primary-500 mt-1 rounded border-gray-300"
                                            required
                                        />
                                        <span>
                                            I accept the{' '}
                                            <button
                                                type="button"
                                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                                            >
                                                Terms of Service
                                            </button>{' '}
                                            and{' '}
                                            <button
                                                type="button"
                                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                                            >
                                                Privacy Policy
                                            </button>
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={registerData.rememberMe}
                                            onChange={(e) =>
                                                setRegisterData({
                                                    ...registerData,
                                                    rememberMe:
                                                        e.target.checked,
                                                })
                                            }
                                            className="text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                                        />
                                        Stay logged in
                                    </label>
                                </div>

                                <PrimaryButton
                                    type="submit"
                                    loading={isLoading}
                                    fullWidth
                                    size="lg"
                                    icon={ArrowRight}
                                >
                                    Create Account
                                </PrimaryButton>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage
