import { ArrowRight, Fingerprint, Lock, Mail, User } from 'lucide-react'
import React, { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import CustomInput from '../../components/ui/CustomInput'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import PrimaryButton from '../../components/ui/PrimaryButton'
import { useAuth } from '../../context/Auth'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import ErrorMessage from '../../components/ui/ErrorMessage'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import {
  loginStep1Schema,
  loginStep2Schema,
  registrationSchema,
} from '../../utils/validation'
import { useFormHandler } from '../../hooks/useFormHandler'

const AuthPage: React.FC = () => {
  // Login state
  const { tab = 'login' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [direction, setDirection] = useState(1)
  const [loginStep, setLoginStep] = useState<
    'email' | 'password' | 'webauthn-choice'
  >('email')
  const isLogin = tab === 'login'
  const {
    login,
    loginState,
    register,
    registerState,
    checkAuthStatus,
    checkAuthStatusState,
    checkAuth,
  } = useAuth()
  const { resendCode } = useEmailTwoFactor()
  const { authenticate, authenticateState } = useWebAuthnTwoFactor()
  // Login state
  const loginForm = useFormHandler({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema:
      loginStep === 'email' ? loginStep1Schema : loginStep2Schema,
    validateOnChange: true,
    validateOnBlur: true,
  })

  // Register state
  const registerForm = useFormHandler({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      rememberMe: false,
    },
    validationSchema: registrationSchema,
    validateOnChange: true,
    validateOnBlur: true,
  })

  const handleEmailSubmit = async () => {
    if (!loginForm.validateForm()) return
    loginForm.clearErrors()
    checkAuthStatusState.resetError()
    const result = await checkAuthStatus(loginForm.values.email)
    if (result.webauthn) {
      setLoginStep('webauthn-choice')
      setDirection(1)
    } else {
      setLoginStep('password')
      setDirection(1)
    }
  }

  const handlePasswordLogin = async () => {
    if (!loginForm.validateForm()) return
    loginForm.clearErrors()
    loginState.resetError()
    const result = await login({
      email: loginForm.values.email,
      password: loginForm.values.password!,
      rememberMe: loginForm.values.rememberMe,
    })
    if (result.success) {
      navigate('/home')
      loginForm.reset()
    } else if (result.requiresTwoFactor || loginState.data?.requiresTwoFactor) {
      if (result.twoFactor.preferredMethod === 'email') {
        await resendCode(loginForm.values.email, 'login')
      }
      navigate(`/2fa-verify/${result.twoFactor.preferredMethod}`, {
        state: {
          email: loginForm.values.email,
          rememberMe: loginForm.values.rememberMe,
          email2FA: result.twoFactor.email || loginState.data?.twoFactor?.email,
          app2FA: result.twoFactor.app || loginState.data?.twoFactor?.app,
          webauthn2FA:
            result.twoFactor.webauthn || loginState.data?.twoFactor?.webauthn,
        },
      })
    }
  }

  const handleWebAuthnLogin = async () => {
    const result = await authenticate(
      'primary',
      loginForm.values.email,
      loginForm.values.rememberMe,
    )

    if (result?.success) {
      navigate('/home')
      await checkAuth()
    } else if (result.requiresTwoFactor || loginState.data?.requiresTwoFactor) {
      if (result.twoFactor.preferredMethod === 'email') {
        await resendCode(loginForm.values.email, 'login')
      }
      navigate(`/2fa-verify/${result.twoFactor.preferredMethod}`, {
        state: {
          email: loginForm.values.email,
          rememberMe: loginForm.values.rememberMe,
          email2FA: result.twoFactor.email || loginState.data?.twoFactor?.email,
          app2FA: result.twoFactor.app || loginState.data?.twoFactor?.app,
          webauthn2FA:
            result.twoFactor.webauthn || loginState.data?.twoFactor?.webauthn,
        },
      })
    } else {
      setLoginStep('password')
      setDirection(-1)
    }
  }

  const handleUsePassword = () => {
    setLoginStep('password')
    setDirection(-1)
  }

  const handleBackToEmail = () => {
    setLoginStep('email')
    setDirection(-1)
  }

  const handleRegister = async () => {
    if (!registerForm.validateForm()) return
    registerForm.clearErrors()
    registerState.resetError()
    const result = await register(registerForm.values)
    if (result.success) {
      navigate('/verify-email', {
        state: {
          email: registerForm.values.email || registerState.data?.email,
          rememberMe:
            registerForm.values.rememberMe || registerState.data?.rememberMe,
        },
      })
      registerForm.reset()
    }
  }

  const renderLoginForm = () => {
    return (
      <form
        onSubmit={(e) =>
          loginForm.handleSubmit(
            loginStep === 'email' ? handleEmailSubmit : handlePasswordLogin,
          )(e)
        }
        className='space-y-6 '
      >
        <AnimatePresence custom={direction} mode='wait' initial={false}>
          <motion.div
            key={loginStep}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? 50 : -50,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
                transition: { duration: 0.3 },
              },
              exit: (direction: number) => ({
                x: direction < 0 ? 50 : -50,
                opacity: 0,
                transition: { duration: 0.2 },
              }),
            }}
            initial='enter'
            animate='center'
            exit='exit'
            layout
            className='space-y-6'
          >
            {loginStep === 'email' ? (
              <div className='space-y-6'>
                <ErrorMessage
                  message={checkAuthStatusState.error}
                  type='error'
                  onClose={() => checkAuthStatusState.resetError()}
                  isVisible={checkAuthStatusState.error !== null}
                />

                <CustomInput
                  id='login-email'
                  name='login-email'
                  type='email'
                  label='Email Address'
                  placeholder='Enter your email'
                  value={loginForm.values.email}
                  onChange={(e) =>
                    loginForm.handleChange('email', e.target.value)
                  }
                  error={loginForm.errors.email}
                  icon={Mail}
                  required
                  autoComplete='email'
                  autoFocus
                  disabled={loginState.loading}
                  onBlur={() => loginForm.handleBlur('email')}
                />
              </div>
            ) : loginStep === 'password' ? (
              <div className='space-y-6'>
                <div className='mb-4 text-center'>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Welcome back, <strong>{loginForm.values.email}</strong>
                  </p>
                </div>
                <ErrorMessage
                  message={loginState.error}
                  type='error'
                  onClose={() => loginState.resetError()}
                  isVisible={loginState.error !== null}
                />

                <CustomInput
                  type='email'
                  label='Email Address'
                  placeholder='Enter your email'
                  value={loginForm.values.email}
                  icon={Mail}
                  required
                  disabled
                  readOnly
                  autoComplete='off'
                  data-1p-ignore='true'
                />

                <CustomInput
                  id='login-password'
                  name='login-password'
                  type='password'
                  label='Password'
                  placeholder='Enter your password'
                  value={loginForm.values.password}
                  onChange={(e) =>
                    loginForm.handleChange('password', e.target.value)
                  }
                  error={loginForm.errors.password}
                  icon={Lock}
                  required
                  autoComplete='current-password'
                  autoFocus
                  disabled={loginState.loading}
                  onBlur={() => loginForm.handleBlur('password')}
                />

                <div className='flex items-center justify-between'>
                  <label className='accent-primary-500 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                    <input
                      type='checkbox'
                      checked={loginForm.values.rememberMe}
                      onChange={(e) =>
                        loginForm.handleChange('rememberMe', e.target.checked)
                      }
                      className='text-primary-600 focus:ring-primary-500 rounded border-gray-300'
                    />
                    Remember me
                  </label>
                  <Link
                    to='/forgot-password'
                    className='text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors'
                  >
                    Forgot password?
                  </Link>
                </div>

                {checkAuthStatusState.data?.webauthn === true && (
                  <div className='text-center'>
                    <PrimaryButton
                      type='button'
                      variant='secondary'
                      size='lg'
                      fullWidth
                      icon={Fingerprint}
                      onClick={() => {
                        setLoginStep('webauthn-choice')
                        setDirection(1)
                      }}
                    >
                      Use passkey instead
                    </PrimaryButton>
                  </div>
                )}

                <PrimaryButton
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleBackToEmail}
                  fullWidth
                >
                  Back to email input
                </PrimaryButton>
              </div>
            ) : (
              <div className='space-y-6'>
                <div className='mb-6 text-center'>
                  <div className='bg-primary-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                    <Fingerprint className='text-primary-600 h-8 w-8' />
                  </div>
                  <p className='text-gray-600 dark:text-gray-400'>
                    We found a passkey for{' '}
                    <strong>{loginForm.values.email}</strong>
                  </p>
                </div>
                <ErrorMessage
                  message={authenticateState.error}
                  type='error'
                  onClose={() => authenticateState.resetError()}
                  isVisible={authenticateState.error !== null}
                />
                <div className='space-y-4'>
                  <PrimaryButton
                    onClick={handleWebAuthnLogin}
                    loading={loginState.loading || authenticateState.loading}
                    fullWidth
                    size='lg'
                    icon={Fingerprint}
                  >
                    Use Passkey
                  </PrimaryButton>

                  <PrimaryButton
                    variant='secondary'
                    onClick={handleUsePassword}
                    disabled={loginState.loading || authenticateState.loading}
                    fullWidth
                    size='lg'
                    icon={Lock}
                  >
                    Use Password Instead
                  </PrimaryButton>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {loginStep !== 'webauthn-choice' && (
          <PrimaryButton
            type='submit'
            loading={checkAuthStatusState.loading || loginState.loading}
            disabled={
              (loginStep === 'email' &&
                (loginState.loading ||
                  !Object.values(loginForm.values).some(Boolean))) ||
              (loginStep === 'password' &&
                (loginState.loading ||
                  !loginForm.isValid ||
                  !Object.values(loginForm.values).some(Boolean) ||
                  !Object.values(loginForm.touched).some(Boolean)))
            }
            fullWidth
            size='lg'
            icon={ArrowRight}
          >
            {loginStep === 'email' ? 'Continue' : 'Sign In'}
          </PrimaryButton>
        )}
      </form>
    )
  }

  return (
    <div className='from-primary-50 to-primary-100 flex min-h-screen items-center justify-center bg-gradient-to-br via-white p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-md'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-800/90'
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='p-8 pb-4'
          >
            <div className='text-center'>
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className='from-primary-600 to-primary-800 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent'
              >
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </motion.h1>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='text-gray-600 dark:text-gray-400'
              >
                {isLogin
                  ? loginStep === 'email'
                    ? 'Sign in to your account'
                    : loginStep === 'password'
                      ? 'Enter your password'
                      : 'Choose authentication method'
                  : 'Create your account'}
              </motion.p>
            </div>
          </motion.div>

          {/* Form Toggle */}
          <div className='mb-6 px-8 relative'>
            <div className='flex rounded-xl bg-gray-100 p-1 dark:bg-gray-700 relative'>
              <motion.div
                layoutId='activeTab'
                className={`absolute inset-0 rounded-lg bg-white shadow-md dark:bg-gray-600`}
                style={{
                  width: '50%',
                  left: isLogin ? '0%' : '50%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />

              <button
                onClick={() => {
                  navigate('/auth/login', {
                    replace: true,
                    state: location.state,
                  })
                  setLoginStep('email')
                }}
                className={`relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  isLogin
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer'
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() =>
                  navigate('/auth/register', {
                    replace: true,
                    state: location.state,
                  })
                }
                className={`relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  !isLogin
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className='px-8 pb-8 relative min-h-[200px]'>
            <AnimatePresence mode='wait' custom={isLogin}>
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{
                  x: isLogin ? -50 : 50,
                  opacity: 0,
                  position: 'relative',
                  width: '100%',
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                  transition: { duration: 0.3, ease: 'easeInOut' },
                }}
                exit={{
                  x: isLogin ? 50 : -50,
                  opacity: 0,
                  transition: { duration: 0.2, ease: 'easeInOut' },
                }}
                className='w-full'
              >
                {isLogin ? (
                  <div className='space-y-6'>{renderLoginForm()}</div>
                ) : (
                  <form
                    onSubmit={(e) =>
                      registerForm.handleSubmit(handleRegister)(e)
                    }
                    className='space-y-6'
                  >
                    <ErrorMessage
                      message={registerState.error}
                      type='error'
                      onClose={() => registerState.resetError()}
                      isVisible={!!registerState.error}
                    />
                    <div className='grid grid-cols-2 gap-4'>
                      <CustomInput
                        name='firstName'
                        id='firstName'
                        type='text'
                        label='First Name'
                        placeholder='John'
                        value={registerForm.values.firstName}
                        onChange={(e) =>
                          registerForm.handleChange('firstName', e.target.value)
                        }
                        error={registerForm.errors.firstName}
                        icon={User}
                        required
                        autoComplete='given-name'
                        autoFocus
                        disabled={registerState.loading}
                        onBlur={() => registerForm.handleBlur('firstName')}
                        helperText='3-30 characters'
                      />
                      <CustomInput
                        id='lastName'
                        name='lastName'
                        type='text'
                        label='Last Name'
                        placeholder='Doe'
                        value={registerForm.values.lastName}
                        onChange={(e) =>
                          registerForm.handleChange('lastName', e.target.value)
                        }
                        error={registerForm.errors.lastName}
                        icon={User}
                        required
                        autoComplete='given-name'
                        disabled={registerState.loading}
                        onBlur={() => registerForm.handleBlur('lastName')}
                        helperText='3-30 characters'
                      />
                    </div>

                    <CustomInput
                      id='email'
                      name='email'
                      type='email'
                      label='Email Address'
                      placeholder='john@example.com'
                      value={registerForm.values.email}
                      onChange={(e) =>
                        registerForm.handleChange('email', e.target.value)
                      }
                      error={registerForm.errors.email}
                      icon={Mail}
                      required
                      autoComplete='email'
                      disabled={registerState.loading}
                      onBlur={() => registerForm.handleBlur('email')}
                    />

                    <CustomInput
                      id='register-password'
                      name='register-password'
                      type='password'
                      label='Password'
                      placeholder='Create a strong password'
                      value={registerForm.values.password}
                      onChange={(e) =>
                        registerForm.handleChange('password', e.target.value)
                      }
                      error={registerForm.errors.password}
                      icon={Lock}
                      required
                      autoComplete='new-password'
                      autoFocus
                      disabled={registerState.loading}
                      onBlur={() => registerForm.handleBlur('password')}
                    />

                    {registerForm.values.password && (
                      <PasswordStrengthMeter
                        password={registerForm.values.password}
                        onStrengthChange={() => {}}
                        className='mb-4'
                      />
                    )}

                    <CustomInput
                      id='confirm-password'
                      name='confirm-password'
                      type='password'
                      label='Confirm Password'
                      placeholder='Confirm your password'
                      value={registerForm.values.confirmPassword}
                      onChange={(e) =>
                        registerForm.handleChange(
                          'confirmPassword',
                          e.target.value,
                        )
                      }
                      error={registerForm.errors.confirmPassword}
                      icon={Lock}
                      required
                      autoComplete='new-password'
                      autoFocus
                      disabled={registerState.loading}
                      onBlur={() => registerForm.handleBlur('confirmPassword')}
                    />

                    <div className='space-y-3'>
                      <label className='accent-primary-500 flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400'>
                        <input
                          type='checkbox'
                          checked={registerForm.values.acceptTerms}
                          onChange={(e) =>
                            registerForm.handleChange(
                              'acceptTerms',
                              e.target.checked,
                            )
                          }
                          onBlur={() => registerForm.handleBlur('acceptTerms')}
                          className='text-primary-600 focus:ring-primary-500 mt-1 rounded border-gray-300 cursor-grab active:cursor-grabbing'
                          required
                        />
                        <span>
                          I accept the{' '}
                          <button
                            type='button'
                            className='text-primary-600 hover:text-primary-700 dark:text-primary-400 underline'
                            onClick={() => {
                              // TODO: Open terms of service page
                            }}
                          >
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button
                            type='button'
                            className='text-primary-600 hover:text-primary-700 dark:text-primary-400 underline'
                            onClick={() => {
                              // TODO: Open privacy policy page
                            }}
                          >
                            Privacy Policy
                          </button>
                        </span>
                      </label>

                      <label className='accent-primary-500 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <input
                          type='checkbox'
                          checked={registerForm.values.rememberMe}
                          onChange={(e) =>
                            registerForm.handleChange(
                              'rememberMe',
                              e.target.checked,
                            )
                          }
                          onBlur={() => registerForm.handleBlur('rememberMe')}
                          className='text-primary-600 focus:ring-primary-500 rounded border-gray-300 cursor-grab active:cursor-grabbing'
                        />
                        Stay logged in
                      </label>
                    </div>

                    <PrimaryButton
                      type='submit'
                      loading={registerState.loading}
                      disabled={
                        !registerForm.isValid ||
                        registerState.loading ||
                        !Object.values(registerForm.values).some(Boolean) ||
                        !Object.values(registerForm.touched).some(Boolean)
                      }
                      fullWidth
                      size='lg'
                      icon={ArrowRight}
                    >
                      Create Account
                    </PrimaryButton>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage
