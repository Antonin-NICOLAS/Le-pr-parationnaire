import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/Auth'
import { Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '../..//layouts/AuthLayout'
import SixDigitCodeInput from '../../components/ui/SixDigitCodeInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import CountdownTimer from '../../components/ui/CountdownTimer'
import ErrorMessage from '../../components/ui/ErrorMessage'

const EmailVerificationPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, rememberMe } = location.state || {}
  const { emailVerification, resendVerificationEmail } = useAuth()
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const lastCodeRef = useRef<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Auto-submit when code is complete
    const codeValue = code.join('')
    if (
      codeValue.length === 6 &&
      codeValue !== lastCodeRef.current &&
      !isLoading
    ) {
      lastCodeRef.current = codeValue
      handleVerification(codeValue)
    }
  }, [code])

  const handleVerification = async (verificationCode: string) => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      await emailVerification(verificationCode, email, rememberMe, () => {
        navigate('/home')
      })
    } catch (error) {
      setError('Invalid verification code. Please try again later.')
      setCode(Array(6).fill(''))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await resendVerificationEmail(email)
      setCanResend(false)
    } catch (error) {
      toast.error('Failed to resend code. Please try again later.')
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
      title='Verify Your Email'
      subtitle={`We've sent a 6-digit code to ${email}`}
      showBackButton
      onBack={handleBack}
    >
      <div className='space-y-6'>
        <div className='flex justify-center'>
          <div className='bg-primary-100 dark:bg-primary-900/20 flex h-16 w-16 items-center justify-center rounded-full'>
            <Mail className='text-primary-600 dark:text-primary-400 h-8 w-8' />
          </div>
        </div>
        {error && (
          <ErrorMessage
            message={error}
            type='error'
            onClose={() => setError(null)}
          />
        )}
        <div className='space-y-4'>
          <SixDigitCodeInput
            value={code}
            onChange={setCode}
            disabled={isLoading}
            error={!!error}
            autoFocus
          />

          <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
            Enter the 6-digit code sent to your email
          </div>
        </div>
        <div className='space-y-2 text-center'>
          {!canResend && (
            <CountdownTimer
              initialSeconds={60}
              onComplete={() => setCanResend(true)}
              className='justify-center'
            />
          )}
        </div>
        <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
          Didn't receive the email? Check your spam folder or{' '}
          <PrimaryButton
            variant='ghost'
            onClick={handleResendCode}
            loading={isLoading}
            disabled={!canResend || isLoading}
            icon={RefreshCw}
            className='mt-2'
          >
            Resend Code
          </PrimaryButton>
        </div>
      </div>
    </AuthLayout>
  )
}

export default EmailVerificationPage
