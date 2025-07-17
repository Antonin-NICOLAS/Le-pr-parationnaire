import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Fingerprint, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '../../layouts/AuthLayout'
import CustomInput from '../../components/ui/CustomInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import { validateEmail, validatePassword } from '../../utils/validation'

type LoginStep = 'email' | 'password' | 'webauthn-choice'

interface UserInfo {
    email: string
    hasWebAuthn: boolean
    has2FA: boolean
    preferred2FAMethod: 'email' | 'app' | null
}

const LoginStepsPage: React.FC = () => {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState<LoginStep>('email')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const emailError = validateEmail(email)
            if (emailError) {
                setError(emailError)
                return
            }

            // Simulate API call to check user info
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Mock user info response
            const mockUserInfo: UserInfo = {
                email,
                hasWebAuthn: email.includes('webauthn'), // Mock condition
                has2FA: email.includes('2fa'), // Mock condition
                preferred2FAMethod: email.includes('app')
                    ? 'app'
                    : email.includes('2fa')
                      ? 'email'
                      : null,
            }

            setUserInfo(mockUserInfo)

            if (mockUserInfo.hasWebAuthn) {
                setCurrentStep('webauthn-choice')
            } else {
                setCurrentStep('password')
            }
        } catch (error) {
            setError('Failed to verify email. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const passwordError = validatePassword(password)
            if (passwordError) {
                setError(passwordError)
                return
            }

            // Simulate API call for password verification
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Mock password verification
            if (password === 'wrongpassword') {
                setError('Invalid password. Please try again.')
                return
            }

            // Check if user has 2FA enabled
            if (userInfo?.has2FA) {
                navigate('/2fa-verify', {
                    state: {
                        email: userInfo.email,
                        preferredMethod: userInfo.preferred2FAMethod,
                    },
                })
            } else {
                toast.success('Login successful!')
                navigate('/dashboard')
            }
        } catch (error) {
            setError('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleWebAuthnLogin = async () => {
        setIsLoading(true)
        setError('')

        try {
            // Simulate WebAuthn authentication
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // Mock WebAuthn success
            toast.success('WebAuthn authentication successful!')

            // Check if user has 2FA enabled (WebAuthn might bypass 2FA)
            if (userInfo?.has2FA) {
                navigate('/2fa-verify', {
                    state: {
                        email: userInfo.email,
                        preferredMethod: userInfo.preferred2FAMethod,
                        webauthnCompleted: true,
                    },
                })
            } else {
                navigate('/dashboard')
            }
        } catch (error) {
            setError(
                'WebAuthn authentication failed. Please try password instead.'
            )
            setCurrentStep('password')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUsePassword = () => {
        setCurrentStep('password')
        setError('')
    }

    const handleBack = () => {
        if (currentStep === 'email') {
            navigate('/auth')
        } else if (
            currentStep === 'password' ||
            currentStep === 'webauthn-choice'
        ) {
            setCurrentStep('email')
            setError('')
        }
    }

    const renderEmailStep = () => (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
            <CustomInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                icon={Mail}
                autoComplete="email"
                autoFocus
                required
            />

            <PrimaryButton
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                className="group"
            >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </PrimaryButton>
        </form>
    )

    const renderWebAuthnChoiceStep = () => (
        <div className="space-y-6">
            <div className="mb-6 text-center">
                <div className="bg-primary-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Fingerprint className="text-primary-600 h-8 w-8" />
                </div>
                <p className="text-deg-gray-600">
                    We found a passkey for <strong>{userInfo?.email}</strong>
                </p>
            </div>

            <div className="space-y-4">
                <PrimaryButton
                    onClick={handleWebAuthnLogin}
                    loading={isLoading}
                    fullWidth
                    size="lg"
                    className="group"
                >
                    <Fingerprint className="h-5 w-5" />
                    Use Passkey
                </PrimaryButton>

                <PrimaryButton
                    variant="outline"
                    onClick={handleUsePassword}
                    disabled={isLoading}
                    fullWidth
                    size="lg"
                >
                    <Lock className="h-5 w-5" />
                    Use Password Instead
                </PrimaryButton>
            </div>

            {error && (
                <div className="text-center">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    )

    const renderPasswordStep = () => (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="mb-6 text-center">
                <p className="text-deg-gray-600">
                    Welcome back, <strong>{userInfo?.email}</strong>
                </p>
            </div>

            <CustomInput
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                icon={Lock}
                autoComplete="current-password"
                autoFocus
                required
            />

            <div className="text-right">
                <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-primary-600 hover:text-primary-700 text-sm transition-colors"
                >
                    Forgot password?
                </button>
            </div>

            <PrimaryButton
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                className="group"
            >
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </PrimaryButton>

            {userInfo?.hasWebAuthn && (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setCurrentStep('webauthn-choice')}
                        className="text-primary-600 hover:text-primary-700 mx-auto flex items-center gap-2 text-sm transition-colors"
                    >
                        <Fingerprint size={16} />
                        Use passkey instead
                    </button>
                </div>
            )}
        </form>
    )

    const getTitle = () => {
        switch (currentStep) {
            case 'email':
                return 'Sign In'
            case 'webauthn-choice':
                return 'Choose Sign In Method'
            case 'password':
                return 'Enter Password'
            default:
                return 'Sign In'
        }
    }

    const getSubtitle = () => {
        switch (currentStep) {
            case 'email':
                return 'Enter your email to get started'
            case 'webauthn-choice':
                return 'Select your preferred authentication method'
            case 'password':
                return 'Enter your password to continue'
            default:
                return ''
        }
    }

    return (
        <AuthLayout
            title={getTitle()}
            subtitle={getSubtitle()}
            showBackButton
            onBack={handleBack}
        >
            {currentStep === 'email' && renderEmailStep()}
            {currentStep === 'webauthn-choice' && renderWebAuthnChoiceStep()}
            {currentStep === 'password' && renderPasswordStep()}
        </AuthLayout>
    )
}

export default LoginStepsPage
