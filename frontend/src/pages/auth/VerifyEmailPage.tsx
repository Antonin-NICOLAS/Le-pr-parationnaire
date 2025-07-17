'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '../..//layouts/AuthLayout'
import SixDigitCodeInput from '../../components/ui/SixDigitCodeInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import CountdownTimer from '../../components/ui/CountdownTimer'
import ErrorMessage from '../../components/ui/ErrorMessage'

const EmailVerificationPage: React.FC = () => {
    const [code, setCode] = useState<string[]>(Array(6).fill(''))
    const [isLoading, setIsLoading] = useState(false)
    const [canResend, setCanResend] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const email = 'user@example.com' // This would come from navigation state

    useEffect(() => {
        // Auto-submit when code is complete
        const codeValue = code.join('')
        if (codeValue.length === 6) {
            handleVerification(codeValue)
        }
    }, [code])

    const handleVerification = async (verificationCode: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Mock validation - in real app this would be validated on server
            if (verificationCode === '123456') {
                toast.success('Email verified successfully!')
                // Navigate to dashboard or next step
            } else {
                throw new Error('Invalid verification code')
            }
        } catch (error) {
            setError('Invalid verification code. Please try again.')
            setCode(Array(6).fill(''))
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success('Verification code sent!')
            setCanResend(false)
        } catch (error) {
            toast.error('Failed to resend code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBack = () => {
        // Navigate back to auth page
        console.log('Navigate back')
    }

    return (
        <AuthLayout
            title="Verify Your Email"
            subtitle={`We've sent a 6-digit code to ${email}`}
            showBackButton
            onBack={handleBack}
        >
            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="bg-primary-100 dark:bg-primary-900/20 flex h-16 w-16 items-center justify-center rounded-full">
                        <Mail className="text-primary-600 dark:text-primary-400 h-8 w-8" />
                    </div>
                </div>

                {error && (
                    <ErrorMessage
                        message={error}
                        type="error"
                        onClose={() => setError(null)}
                    />
                )}

                <div className="space-y-4">
                    <SixDigitCodeInput
                        value={code}
                        onChange={setCode}
                        onComplete={(completeCode) =>
                            handleVerification(completeCode)
                        }
                        disabled={isLoading}
                        error={!!error}
                        autoFocus
                    />

                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter the 6-digit code sent to your email
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    {!canResend ? (
                        <CountdownTimer
                            initialSeconds={60}
                            onComplete={() => setCanResend(true)}
                            className="justify-center"
                        />
                    ) : (
                        <PrimaryButton
                            variant="ghost"
                            onClick={handleResendCode}
                            loading={isLoading}
                            icon={RefreshCw}
                        >
                            Resend Code
                        </PrimaryButton>
                    )}
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                        onClick={handleResendCode}
                        disabled={!canResend || isLoading}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50"
                    >
                        try again
                    </button>
                </div>
            </div>
        </AuthLayout>
    )
}

export default EmailVerificationPage
