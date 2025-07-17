'use client'

import type React from 'react'
import { useState } from 'react'
import { Shield, Smartphone, Mail, Key } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '../../layouts/AuthLayout'
import SixDigitCodeInput from '../../components/ui/SixDigitCodeInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import CountdownTimer from '../../components/ui/CountdownTimer'
import ErrorMessage from '../../components/ui/ErrorMessage'

const TwoFactorPage: React.FC = () => {
    const [code, setCode] = useState<string[]>(Array(6).fill(''))
    const [isLoading, setIsLoading] = useState(false)
    const [currentMethod, setCurrentMethod] = useState<
        'email' | 'app' | 'webauthn' | 'backup'
    >('email')
    const [canResend, setCanResend] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [backupCodes, setBackupCodes] = useState<string[]>(Array(8).fill(''))

    // Mock user 2FA settings
    const user2FA = {
        email: true,
        app: true,
        webauthn: true,
        preferredMethod: 'email' as const,
    }

    const handleVerification = async (verificationCode: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Mock validation
            if (
                verificationCode === '123456' ||
                verificationCode === 'ABCD1234'
            ) {
                toast.success('2FA verification successful!')
                // Navigate to dashboard
            } else {
                throw new Error('Invalid code')
            }
        } catch (error) {
            setError('Invalid verification code. Please try again.')
            setCode(Array(6).fill(''))
            setBackupCodes(Array(8).fill(''))
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (currentMethod !== 'email') return

        setIsLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success('New code sent to your email!')
            setCanResend(false)
        } catch (error) {
            toast.error('Failed to resend code.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleWebAuthn = async () => {
        setIsLoading(true)
        try {
            // Simulate WebAuthn authentication
            await new Promise((resolve) => setTimeout(resolve, 2000))
            toast.success('WebAuthn authentication successful!')
            // Navigate to dashboard
        } catch (error) {
            toast.error('WebAuthn authentication failed.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackupCodeSubmit = () => {
        const backupCode = backupCodes.join('').toUpperCase()
        if (backupCode.length === 8) {
            handleVerification(backupCode)
        }
    }

    const getMethodConfig = () => {
        const configs = {
            email: {
                title: 'Email Verification',
                subtitle: 'Enter the 6-digit code sent to your email',
                icon: Mail,
                color: 'text-blue-600 dark:text-blue-400',
                bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            },
            app: {
                title: 'Authenticator App',
                subtitle: 'Enter the 6-digit code from your authenticator app',
                icon: Smartphone,
                color: 'text-green-600 dark:text-green-400',
                bgColor: 'bg-green-100 dark:bg-green-900/20',
            },
            webauthn: {
                title: 'Security Key',
                subtitle: 'Use your security key or biometric authentication',
                icon: Key,
                color: 'text-purple-600 dark:text-purple-400',
                bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            },
            backup: {
                title: 'Backup Codes',
                subtitle: 'Enter one of your 8-character backup codes',
                icon: Shield,
                color: 'text-orange-600 dark:text-orange-400',
                bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            },
        }
        return configs[currentMethod]
    }

    const config = getMethodConfig()
    const IconComponent = config.icon

    return (
        <AuthLayout
            title="Two-Factor Authentication"
            subtitle="Please verify your identity to continue"
            showBackButton
            onBack={() => console.log('Navigate back')}
        >
            <div className="space-y-6">
                <div className="flex justify-center">
                    <div
                        className={`h-16 w-16 ${config.bgColor} flex items-center justify-center rounded-full`}
                    >
                        <IconComponent className={`h-8 w-8 ${config.color}`} />
                    </div>
                </div>

                {/* Method Selection */}
                <div className="grid grid-cols-2 gap-2">
                    {user2FA.email && (
                        <button
                            onClick={() => setCurrentMethod('email')}
                            className={`rounded-lg border-2 p-3 transition-all ${
                                currentMethod === 'email'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            <Mail className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div className="text-xs font-medium">Email</div>
                        </button>
                    )}

                    {user2FA.app && (
                        <button
                            onClick={() => setCurrentMethod('app')}
                            className={`rounded-lg border-2 p-3 transition-all ${
                                currentMethod === 'app'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            <Smartphone className="mx-auto mb-1 h-5 w-5 text-green-600 dark:text-green-400" />
                            <div className="text-xs font-medium">App</div>
                        </button>
                    )}
                </div>

                <div className="text-center">
                    <h3 className="mb-1 text-lg font-semibold">
                        {config.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {config.subtitle}
                    </p>
                </div>

                {error && (
                    <ErrorMessage
                        message={error}
                        type="error"
                        onClose={() => setError(null)}
                    />
                )}

                {currentMethod === 'webauthn' ? (
                    <div className="space-y-4 text-center">
                        <PrimaryButton
                            onClick={handleWebAuthn}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            icon={Key}
                        >
                            Use Security Key
                        </PrimaryButton>
                    </div>
                ) : currentMethod === 'backup' ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                            {backupCodes.map((code, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={code}
                                    onChange={(e) => {
                                        const newCodes = [...backupCodes]
                                        newCodes[index] =
                                            e.target.value.toUpperCase()
                                        setBackupCodes(newCodes)
                                    }}
                                    className="focus:border-primary-500 h-10 w-full rounded border-2 border-gray-200 bg-white text-center font-mono text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                    maxLength={1}
                                    placeholder="•"
                                />
                            ))}
                        </div>
                        <PrimaryButton
                            onClick={handleBackupCodeSubmit}
                            loading={isLoading}
                            fullWidth
                            disabled={backupCodes.join('').length !== 8}
                        >
                            Verify Backup Code
                        </PrimaryButton>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <SixDigitCodeInput
                            value={code}
                            onChange={setCode}
                            onComplete={handleVerification}
                            disabled={isLoading}
                            error={!!error}
                            autoFocus
                        />

                        {currentMethod === 'email' && (
                            <div className="text-center">
                                {!canResend ? (
                                    <CountdownTimer
                                        initialSeconds={30}
                                        onComplete={() => setCanResend(true)}
                                        className="justify-center"
                                    />
                                ) : (
                                    <PrimaryButton
                                        variant="ghost"
                                        onClick={handleResendCode}
                                        loading={isLoading}
                                    >
                                        Resend Code
                                    </PrimaryButton>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Alternative methods */}
                <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-600">
                    <div className="mb-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        Having trouble? Try alternative methods:
                    </div>

                    <div className="flex flex-col gap-2">
                        {user2FA.webauthn && currentMethod !== 'webauthn' && (
                            <button
                                onClick={() => setCurrentMethod('webauthn')}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1 text-sm"
                            >
                                Use Security Key / Biometric
                            </button>
                        )}

                        {currentMethod !== 'backup' && (
                            <button
                                onClick={() => setCurrentMethod('backup')}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1 text-sm"
                            >
                                Use Backup Codes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}

export default TwoFactorPage
