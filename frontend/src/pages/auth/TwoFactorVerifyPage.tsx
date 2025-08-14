import {
  Fingerprint,
  Key,
  Mail,
  Shield,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import ResendSection from '../../components/ui/ResendSection'
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

type MethodType =
  | 'email'
  | 'app'
  | 'webauthn'
  | 'backup_code'
  | 'security_question'

const TwoFactorVerifyPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    email = 'antoninnicolas@icloud.com',
    rememberMe = false,
    email2FA = true,
    app2FA = true,
    webauthn2FA = true,
  } = location.state || {}

  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const { method } = useParams<{ method: string }>()
  const [currentMethod, setCurrentMethod] = useState<MethodType>(
    method as MethodType,
  )
  const [error, setError] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>(Array(8).fill(''))
  const [securityAnswers, setSecurityAnswers] = useState<
    { questionId: string; answer: string }[]
  >([])
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([])
  const [direction, setDirection] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  const { resendCode, resendCodeState } = useEmailTwoFactor()
  const { authenticate, authenticateState } = useWebAuthnTwoFactor()
  const { twoFactorLogin, twoFactorLoginState } = useTwoFactorAuth()
  const { getAvailableQuestions, verifySecurityQuestions } =
    useSecurityQuestions()

  const availableMethods: MethodType[] = []
  if (email2FA) availableMethods.push('email')
  if (app2FA) availableMethods.push('app')
  if (webauthn2FA) availableMethods.push('webauthn')
  availableMethods.push('backup_code', 'security_question')

  useEffect(() => {
    if (currentMethod === 'security_question') {
      const loadQuestions = async () => {
        const questions = await getAvailableQuestions()
        setSecurityQuestions(questions.slice(0, 2))
        setSecurityAnswers(
          questions.slice(0, 2).map((q) => ({ questionId: q.id, answer: '' })),
        )
      }
      loadQuestions()
    }
  }, [currentMethod])

  const changeMethod = (newMethod: MethodType) => {
    if (isAnimating || newMethod === currentMethod) return

    setDirection(
      newMethod === 'backup_code' || newMethod === 'security_question'
        ? 1
        : availableMethods.indexOf(newMethod) >
            availableMethods.indexOf(currentMethod)
          ? 1
          : -1,
    )
    setIsAnimating(true)

    setTimeout(() => {
      setCurrentMethod(newMethod)
      navigate(`/2fa-verify/${newMethod}`, {
        replace: true,
        state: { email, rememberMe, email2FA, app2FA, webauthn2FA },
      })
      setIsAnimating(false)
    }, 300)
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
    await resendCode(email, 'login')
  }

  const handleWebAuthn = async () => {
    authenticateState.resetError()
    if (!email) return
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

  const renderMethodContent = () => {
    switch (currentMethod) {
      case 'webauthn':
        return (
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
        )
      case 'backup_code':
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-4 gap-2'>
              {backupCodes.map((code, index) => (
                <motion.input
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
                  whileFocus={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
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
        )
      case 'security_question':
        return (
          <div className='space-y-4'>
            {securityQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                className='space-y-2'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
              </motion.div>
            ))}
            <PrimaryButton
              onClick={handleSecurityQuestionSubmit}
              loading={twoFactorLoginState.loading}
              fullWidth
              disabled={securityAnswers.some((answer) => !answer.answer.trim())}
            >
              Verify Answers
            </PrimaryButton>
          </div>
        )
      default:
        return (
          <div className='space-y-4'>
            <SixDigitCodeInput
              value={code}
              onChange={setCode}
              onComplete={() => handleVerification}
              disabled={twoFactorLoginState.loading}
              error={!!error}
              autoFocus
            />
            {currentMethod === 'email' && (
              <ResendSection
                countdownSeconds={30}
                loading={resendCodeState.loading}
                variant='block'
                onResend={handleResendCode}
              />
            )}
          </div>
        )
    }
  }

  return (
    <AuthLayout
      title='Two-Factor Authentication'
      subtitle='Please verify your identity to continue'
      showBackButton
      onBack={() => navigate('/auth/login')}
    >
      <div className='space-y-6'>
        {/* Method Selection */}
        <div className='grid grid-cols-3 gap-2'>
          {email2FA && (
            <motion.button
              onClick={async () => {
                ;(changeMethod('email'), await resendCode(email, 'login'))
              }}
              className={`rounded-lg border-2 p-3 transition-all ${
                currentMethod === 'email'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className='mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-400' />
              <div className='text-xs font-medium text-blue-600 dark:text-blue-200'>
                Email
              </div>
            </motion.button>
          )}

          {app2FA && (
            <motion.button
              onClick={() => changeMethod('app')}
              className={`rounded-lg border-2 p-3 transition-all ${
                currentMethod === 'app'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Smartphone className='mx-auto mb-1 h-5 w-5 text-yellow-600 dark:text-yellow-400' />
              <div className='text-xs font-medium text-yellow-600 dark:text-yellow-200'>
                App
              </div>
            </motion.button>
          )}

          {webauthn2FA && (
            <motion.button
              onClick={() => changeMethod('webauthn')}
              className={`rounded-lg border-2 p-3 transition-all ${
                currentMethod === 'webauthn'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Fingerprint className='mx-auto mb-1 h-5 w-5 text-purple-600 dark:text-purple-400' />
              <div className='text-xs font-medium text-purple-600 dark:text-purple-200'>
                WebAuthn
              </div>
            </motion.button>
          )}
        </div>

        {/* Main Content */}
        <div className='relative overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800/50 dark:shadow-none'>
          <AnimatePresence custom={direction} mode='wait'>
            <motion.div
              key={currentMethod}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? 100 : -100,
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                  transition: { duration: 0.3 },
                },
                exit: (direction: number) => ({
                  x: direction < 0 ? 100 : -100,
                  opacity: 0,
                  transition: { duration: 0.2 },
                }),
              }}
              initial='enter'
              animate='center'
              exit='exit'
              className='space-y-6'
            >
              <div className='flex justify-center'>
                <motion.div
                  className={`h-16 w-16 ${config.bgColor} flex items-center justify-center rounded-full`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <IconComponent className={`h-8 w-8 ${config.color}`} />
                </motion.div>
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

              {renderMethodContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Alternative methods */}
        <motion.div
          className='space-y-2 border-t border-gray-200 pt-4 dark:border-gray-600'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className='mb-3 text-center text-sm text-gray-600 dark:text-gray-400'>
            Having trouble? Try alternative methods:
          </div>

          <div className='flex justify-center gap-4'>
            {currentMethod !== 'security_question' && (
              <motion.button
                onClick={() => changeMethod('security_question')}
                className='flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400'
                whileHover={{ x: 2 }}
              >
                <ChevronLeft className='h-4 w-4' />
                Security Questions
              </motion.button>
            )}

            {currentMethod !== 'backup_code' && (
              <motion.button
                onClick={() => changeMethod('backup_code')}
                className='flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400'
                whileHover={{ x: -2 }}
              >
                Backup Codes
                <ChevronRight className='h-4 w-4' />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  )
}

export default TwoFactorVerifyPage
