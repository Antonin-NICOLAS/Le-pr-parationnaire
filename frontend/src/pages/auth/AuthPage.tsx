import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Fingerprint } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/Auth'
import CustomInput from '../../components/ui/CustomInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import type { RegisterData, PasswordStrength } from '../../types/auth'

const AuthPage: React.FC = () => {
  // Login state
  const { tab = 'login' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isLogin = tab === 'login'
  const { login, register, checkAuthStatus } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loginStep, setLoginStep] = useState<
    'email' | 'password' | 'webauthn-choice'
  >('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [hasWebAuthn, setHasWebAuthn] = useState(false)

  // Register state
  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    rememberMe: false,
    onSuccess: () => navigate('/'),
  })

  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const webauthnEnabled = await checkAuthStatus(email)
      setHasWebAuthn(webauthnEnabled)

      if (webauthnEnabled) {
        setLoginStep('webauthn-choice')
      } else {
        setLoginStep('password')
      }
    } catch (error) {
      toast.error('Failed to check email. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password, rememberMe, () => {
        navigate('/')
      })
    } catch (error) {
      toast.error('Login failed. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWebAuthnLogin = async () => {
    setIsLoading(true)
    try {
      // Ici vous devrez implémenter la logique WebAuthn réelle
      // Pour l'instant, c'est une simulation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Authenticated with WebAuthn!')
    } catch (error) {
      toast.error(
        'WebAuthn authentication failed. Please try password instead.',
      )
      setLoginStep('password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsePassword = () => {
    setLoginStep('password')
  }

  const handleBackToEmail = () => {
    setLoginStep('email')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

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

    if (passwordStrength && passwordStrength.score < 70) {
      toast.error('Please choose a stronger password')
      return
    }

    setIsLoading(true)

    try {
      await register(
        {
          email: registerData.email,
          password: registerData.password,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          rememberMe: registerData.rememberMe,
        },
        () => {
          navigate('/verify-email', {
            state: {
              email: registerData.email,
              rememberMe: registerData.rememberMe,
            },
          })
        },
      )
    } catch (error) {
      toast.error('Registration failed. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderLoginForm = () => {
    switch (loginStep) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className='space-y-6'>
            <CustomInput
              type='email'
              label='Email Address'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              autoComplete='email'
              autoFocus
            />

            <PrimaryButton
              type='submit'
              loading={isLoading}
              fullWidth
              size='lg'
              icon={ArrowRight}
            >
              Continue
            </PrimaryButton>
          </form>
        )
      case 'password':
        return (
          <form onSubmit={handlePasswordLogin} className='space-y-6'>
            <div className='mb-4 text-center'>
              <p className='text-gray-600 dark:text-gray-400'>
                Welcome back, <strong>{email}</strong>
              </p>
            </div>

            <CustomInput
              type='email'
              label='Email Address'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              disabled
            />

            <CustomInput
              type='password'
              label='Password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              autoComplete='current-password'
              autoFocus
            />

            <div className='flex items-center justify-between'>
              <label className='accent-primary-500 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='text-primary-600 focus:ring-primary-500 rounded border-gray-300'
                />
                Remember me
              </label>
              <button
                type='button'
                className='text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm'
              >
                Forgot password?
              </button>
            </div>

            <PrimaryButton
              type='submit'
              loading={isLoading}
              fullWidth
              size='lg'
              icon={ArrowRight}
            >
              Sign In
            </PrimaryButton>

            {hasWebAuthn && (
              <div className='text-center'>
                <PrimaryButton
                  type='button'
                  variant='secondary'
                  size='lg'
                  fullWidth
                  onClick={() => setLoginStep('webauthn-choice')}
                >
                  <Fingerprint size={16} />
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
          </form>
        )
      case 'webauthn-choice':
        return (
          <div className='space-y-6'>
            <div className='mb-6 text-center'>
              <div className='bg-primary-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Fingerprint className='text-primary-600 h-8 w-8' />
              </div>
              <p className='text-gray-600 dark:text-gray-400'>
                We found a passkey for <strong>{email}</strong>
              </p>
            </div>

            <div className='space-y-4'>
              <PrimaryButton
                onClick={handleWebAuthnLogin}
                loading={isLoading}
                fullWidth
                size='lg'
                icon={Fingerprint}
              >
                Use Passkey
              </PrimaryButton>

              <PrimaryButton
                variant='secondary'
                onClick={handleUsePassword}
                disabled={isLoading}
                fullWidth
                size='lg'
                icon={Lock}
              >
                Use Password Instead
              </PrimaryButton>
            </div>

            <PrimaryButton
              type='button'
              onClick={handleBackToEmail}
              variant='outline'
              size='sm'
              fullWidth
              className='text-primary-600 hover:text-primary-700 text-center text-sm'
            >
              Back to email input
            </PrimaryButton>
          </div>
        )
    }
  }

  return (
    <div className='from-primary-50 to-primary-100 flex min-h-screen items-center justify-center bg-gradient-to-br via-white p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-md'>
        <div className='overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-800/90'>
          {/* Header */}
          <div className='p-8 pb-4'>
            <div className='text-center'>
              <h1 className='from-primary-600 to-primary-800 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent'>
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                {isLogin
                  ? loginStep === 'email'
                    ? 'Sign in to your account'
                    : loginStep === 'password'
                      ? 'Enter your password'
                      : 'Choose authentication method'
                  : 'Create your account'}
              </p>
            </div>
          </div>

          {/* Form Toggle */}
          <div className='mb-6 px-8'>
            <div className='flex rounded-xl bg-gray-100 p-1 dark:bg-gray-700'>
              <button
                onClick={() => {
                  navigate('/auth/login', {
                    replace: true,
                    state: location.state,
                  })
                  setLoginStep('email')
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-gray-900 shadow-md dark:bg-gray-600 dark:text-white'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
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
          <div className='px-8 pb-8'>
            {isLogin ? (
              <div className='animate-fade-in'>{renderLoginForm()}</div>
            ) : (
              <form
                onSubmit={handleRegister}
                className='animate-fade-in space-y-6'
              >
                <div className='grid grid-cols-2 gap-4'>
                  <CustomInput
                    type='text'
                    label='First Name'
                    placeholder='John'
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        firstName: e.target.value,
                      })
                    }
                    icon={User}
                    required
                    autoComplete='given-name'
                  />
                  <CustomInput
                    type='text'
                    label='Last Name'
                    placeholder='Doe'
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        lastName: e.target.value,
                      })
                    }
                    icon={User}
                    required
                    autoComplete='family-name'
                  />
                </div>

                <CustomInput
                  type='email'
                  label='Email Address'
                  placeholder='john@example.com'
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  icon={Mail}
                  required
                  autoComplete='email'
                />

                <CustomInput
                  type='password'
                  label='Password'
                  placeholder='Create a strong password'
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  icon={Lock}
                  required
                  autoComplete='new-password'
                />

                {registerData.password && (
                  <PasswordStrengthMeter
                    password={registerData.password}
                    onStrengthChange={setPasswordStrength}
                    className='mb-4'
                  />
                )}

                <CustomInput
                  type='password'
                  label='Confirm Password'
                  placeholder='Confirm your password'
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  icon={Lock}
                  required
                  autoComplete='new-password'
                />

                <div className='space-y-3'>
                  <label className='accent-primary-500 flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400'>
                    <input
                      type='checkbox'
                      checked={registerData.acceptTerms}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          acceptTerms: e.target.checked,
                        })
                      }
                      className='text-primary-600 focus:ring-primary-500 mt-1 rounded border-gray-300'
                      required
                    />
                    <span>
                      I accept the{' '}
                      <button
                        type='button'
                        className='text-primary-600 hover:text-primary-700 dark:text-primary-400 underline'
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type='button'
                        className='text-primary-600 hover:text-primary-700 dark:text-primary-400 underline'
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>

                  <label className='accent-primary-500 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                    <input
                      type='checkbox'
                      checked={registerData.rememberMe}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          rememberMe: e.target.checked,
                        })
                      }
                      className='text-primary-600 focus:ring-primary-500 rounded border-gray-300'
                    />
                    Stay logged in
                  </label>
                </div>

                <PrimaryButton
                  type='submit'
                  loading={isLoading}
                  fullWidth
                  size='lg'
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
