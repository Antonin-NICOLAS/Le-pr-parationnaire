import {
  Fingerprint,
  Key,
  Mail,
  Shield,
  Smartphone,
  RefreshCw,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import CountdownTimer from '../../components/ui/CountdownTimer'
import CustomInput from '../../components/ui/CustomInput'
import ErrorMessage from '../../components/ui/ErrorMessage'
import PrimaryButton from '../../components/ui/PrimaryButton'
import SixDigitCodeInput from '../../components/ui/SixDigitCodeInput'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import useSecurityQuestions from '../../hooks/TwoFactor/SecurityQuestions'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import AuthLayout from '../../layouts/AuthLayout'
import type { SecurityQuestion } from '../../types/user'

const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    email,
    rememberMe = false,
    email2FA = false,
    app2FA = false,
    webauthn2FA = false,
  } = location.state || {}
  const lastCodeRef = useRef<string>('')
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const { method } = useParams<{ method: string }>()
  const [currentMethod, setCurrentMethod] = useState<
    'email' | 'app' | 'webauthn' | 'backup_code' | 'security_question'
  >(method as any)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>(Array(8).fill(''))
  const [securityAnswers, setSecurityAnswers] = useState<
    { questionId: string; answer: string }[]
  >([])
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([])
  const { resendCode, resendCodeState } = useEmailTwoFactor()
  const { authenticate, authenticateState } = useWebAuthnTwoFactor()
  const { twoFactorLogin, twoFactorLoginState } = useTwoFactorAuth()
  const { getAvailableQuestions, verifySecurityQuestions } =
    useSecurityQuestions()

  useEffect(() => {
    if (currentMethod === 'security_question') {
      const loadQuestions = async () => {
        const questions = await getAvailableQuestions()
        setSecurityQuestions(questions.slice(0, 2)) // Get first 2 questions
        setSecurityAnswers(
          questions.slice(0, 2).map((q) => ({ questionId: q.id, answer: '' })),
        )
      }
      loadQuestions()
    }
  }, [currentMethod])

  useEffect(() => {
    // Auto-submit when code is complete
    const codeValue = code.join('')
    if (
      codeValue.length === 6 &&
      !twoFactorLoginState.loading &&
      codeValue !== lastCodeRef.current
    ) {
      lastCodeRef.current = codeValue
      handleVerification(codeValue)
    }
  }, [code])

  const changeMethod = (newMethod: typeof currentMethod) => {
    setCurrentMethod(newMethod)
    navigate(`/2fa-verify/${newMethod}`, {
      replace: true,
      state: { email, rememberMe, email2FA, app2FA, webauthn2FA },
    })
  }

  const handleVerification = async (verificationCode: string) => {
    twoFactorLoginState.resetError()
    const result = await twoFactorLogin(
      email,
      rememberMe,
      currentMethod,
      verificationCode,
    )
    if (result.success) {
      setCode(Array(6).fill(''))
      setBackupCodes(Array(8).fill(''))
      navigate('/home')
    }
  }

  const handleResendCode = async () => {
    resendCodeState.resetError()
    if (currentMethod !== 'email') return
    const result = await resendCode(email, 'login')
    if (result.success) {
      setCanResend(false)
    }
  }

  const handleWebAuthn = async () => {
    authenticateState.resetError()
    if (!email) return
    console.log(email)
    const result = await authenticate('secondary', email, rememberMe)

    if (result.success) {
      navigate('/home')
    }
  }

  const handleBackupCodeSubmit = () => {
    const backupCode = backupCodes.join('').toUpperCase()
    if (backupCode.length === 8) {
      handleVerification(backupCode)
    }
  }

  const handleSecurityQuestionSubmit = async () => {
    if (securityAnswers.some((answer) => !answer.answer.trim())) {
      setError('Please answer all security questions')
      return
    }

    const success = await verifySecurityQuestions(securityAnswers)
    if (success) {
      const result = await twoFactorLogin(
        email,
        rememberMe,
        'security_question',
        JSON.stringify(securityAnswers),
      )
      if (result.success) {
        navigate('/home')
      }
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
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      },
      webauthn: {
        title: 'Security Key',
        subtitle: 'Use your security key or biometric authentication',
        icon: Key,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      },
      backup_code: {
        title: 'Backup Codes',
        subtitle: 'Enter one of your 8-character backup codes',
        icon: Shield,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      },
      security_question: {
        title: 'Security Questions',
        subtitle: 'Answer your security questions',
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
      title='Two-Factor Authentication'
      subtitle='Please verify your identity to continue'
      showBackButton
      onBack={() => navigate('/auth/login')}
    >
      <div className='space-y-6'>
        <div className='flex justify-center'>
          <div
            className={`h-16 w-16 ${config.bgColor} flex items-center justify-center rounded-full`}
          >
            <IconComponent className={`h-8 w-8 ${config.color}`} />
          </div>
        </div>

        {/* Method Selection */}
        <div className='grid grid-cols-3 gap-2'>
          {email2FA && (
            <button
              onClick={() => changeMethod('email')}
              className={`rounded-lg border-2 p-3 transition-all ${
                currentMethod === 'email'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <Mail className='mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-400' />
              <div className='text-xs font-medium text-blue-600 dark:text-blue-200'>
                Email
              </div>
            </button>
          )}

          {app2FA && (
            <button
              onClick={() => changeMethod('app')}
              className={`rounded-lg border-2 p-3 transition-all ${
                currentMethod === 'app'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <Smartphone className='mx-auto mb-1 h-5 w-5 text-yellow-600 dark:text-yellow-400' />
              <div className='text-xs font-medium text-yellow-600 dark:text-yellow-200'>
                App
              </div>
            </button>
          )}

          {webauthn2FA && (
            <button
              onClick={() => changeMethod('webauthn')}
              className={`rounded-lg border-2 p-3 transition-all ${
                currentMethod === 'webauthn'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <Fingerprint className='mx-auto mb-1 h-5 w-5 text-purple-600 dark:text-purple-400' />
              <div className='text-xs font-medium text-purple-600 dark:text-purple-200'>
                WebAuthn
              </div>
            </button>
          )}
        </div>

        <div className='text-center'>
          <h3 className='mb-1 text-lg font-semibold text-gray-900 dark:text-gray-200'>
            {config.title}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {config.subtitle}
          </p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type='error'
            onClose={() => setError(null)}
          />
        )}

        {currentMethod === 'webauthn' ? (
          <div className='space-y-4 text-center'>
            <PrimaryButton
              onClick={handleWebAuthn}
              loading={authenticateState.loading}
              fullWidth
              size='lg'
              icon={Key}
              disabled={authenticateState.loading}
            >
              Use Security Key
            </PrimaryButton>
          </div>
        ) : currentMethod === 'backup_code' ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-4 gap-2'>
              {backupCodes.map((code, index) => (
                <input
                  key={index}
                  type='text'
                  value={code}
                  onChange={(e) => {
                    const newCodes = [...backupCodes]
                    newCodes[index] = e.target.value.toUpperCase()
                    setBackupCodes(newCodes)
                  }}
                  className='focus:border-primary-500 h-10 w-full rounded border-2 border-gray-200 bg-white text-center font-mono text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800'
                  maxLength={1}
                  placeholder='•'
                />
              ))}
            </div>
            <PrimaryButton
              onClick={handleBackupCodeSubmit}
              loading={twoFactorLoginState.loading}
              fullWidth
              disabled={
                backupCodes.join('').length !== 8 || twoFactorLoginState.loading
              }
            >
              Verify Backup Code
            </PrimaryButton>
          </div>
        ) : currentMethod === 'security_question' ? (
          <div className='space-y-4'>
            <div className='space-y-4'>
              {securityQuestions.map((question, index) => (
                <div key={question.id} className='space-y-2'>
                  <label className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {question.question}
                  </label>
                  <CustomInput
                    type='text'
                    value={securityAnswers[index]?.answer || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newAnswers = [...securityAnswers]
                      newAnswers[index] = {
                        ...newAnswers[index],
                        answer: e.target.value,
                      }
                      setSecurityAnswers(newAnswers)
                    }}
                    placeholder='Your answer'
                    autoComplete='off'
                  />
                </div>
              ))}
            </div>
            <PrimaryButton
              onClick={handleSecurityQuestionSubmit}
              loading={twoFactorLoginState.loading}
              fullWidth
              disabled={securityAnswers.some((answer) => !answer.answer.trim())}
            >
              Verify Answers
            </PrimaryButton>
          </div>
        ) : (
          <div className='space-y-4'>
            <SixDigitCodeInput
              value={code}
              onChange={setCode}
              disabled={twoFactorLoginState.loading}
              error={!!error}
              autoFocus
            />

            {currentMethod === 'email' && (
              <div className='text-center'>
                {!canResend ? (
                  <CountdownTimer
                    initialSeconds={30}
                    onComplete={() => setCanResend(true)}
                    className='justify-center'
                  />
                ) : (
                  <PrimaryButton
                    variant='ghost'
                    icon={RefreshCw}
                    onClick={handleResendCode}
                    loading={resendCodeState.loading}
                    disabled={resendCodeState.loading}
                  >
                    Resend Code
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>
        )}

        {/* Alternative methods */}
        <div className='space-y-2 border-t border-gray-200 pt-4 dark:border-gray-600'>
          <div className='mb-3 text-center text-sm text-gray-600 dark:text-gray-400'>
            Having trouble? Try alternative methods:
          </div>

          <div className='flex flex-col gap-2'>
            {currentMethod !== 'security_question' && (
              <button
                onClick={() => changeMethod('security_question')}
                className='text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1 text-sm'
              >
                Use Security Questions
              </button>
            )}

            {currentMethod !== 'backup_code' && (
              <button
                onClick={() => changeMethod('backup_code')}
                className='text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1 text-sm'
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
