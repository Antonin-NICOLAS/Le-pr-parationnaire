import { Mail, RefreshCw } from 'lucide-react'
import type React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import ResendSection from '../../components/ui/ResendSection'
import ErrorMessage from '../../components/ui/ErrorMessage'
import SixDigitCodeInput from '../../components/ui/SixDigitCodeInput'
import { useAuth } from '../../context/Auth'
import AuthLayout from '../../layouts/AuthLayout'
import { useFormHandler } from '../../hooks/useFormHandler'
import { emailVerificationSchema } from '../../utils/validation'

const EmailVerificationPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, rememberMe } = location.state || {}
  const {
    emailVerification,
    emailVerificationState,
    resendVerificationEmail,
    resendVerificationEmailState,
  } = useAuth()

  const form = useFormHandler({
    initialValues: {
      token: Array(6).fill(''),
      email: email || '',
      rememberMe: rememberMe || false,
    },
    validationSchema: emailVerificationSchema,
    validateOnBlur: true,
    validateOnChange: true,
  })

  const errorMessage =
    emailVerificationState.error || resendVerificationEmailState.error

  const handleVerification = async (token: string) => {
    if (!form.validateForm()) return
    form.clearErrors()
    emailVerificationState.resetError()
    resendVerificationEmailState.resetError()

    const result = await emailVerification({ token, email, rememberMe })
    if (result.success) {
      navigate('/home')
      form.reset()
    }
  }

  const handleResendCode = async () => {
    emailVerificationState.resetError()
    resendVerificationEmailState.resetError()
    await resendVerificationEmail(email)
  }

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/auth/register')
    }
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
        <ErrorMessage
          message={errorMessage}
          type='error'
          onClose={() => {
            emailVerificationState.resetError()
            resendVerificationEmailState.resetError()
          }}
          isVisible={!!errorMessage}
        />
        <div className='space-y-4'>
          <SixDigitCodeInput
            value={form.values.token}
            onChange={(value) => form.handleChange('token', value)}
            loading={
              emailVerificationState.loading ||
              resendVerificationEmailState.loading
            }
            disabled={
              emailVerificationState.loading ||
              resendVerificationEmailState.loading
            }
            onComplete={() => handleVerification(form.values.token.join(''))}
            error={!!form.errors.token}
            autoFocus
          />

          <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
            Entrez le code à 6 chiffres envoyé à votre adresse email
          </div>
        </div>
        <ResendSection
          onResend={() => handleResendCode()}
          loading={resendVerificationEmailState.loading}
          countdownSeconds={60}
          icon={RefreshCw}
          variant='block'
          align='center'
        />
      </div>
    </AuthLayout>
  )
}

export default EmailVerificationPage
