import React, { useState, useEffect } from 'react'
import { Star, Mail, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import CountdownTimer from '../ui/CountdownTimer'
import ErrorMessage from '../ui/ErrorMessage'
import PrimaryButton from '../ui/PrimaryButton'
import SixDigitCodeInput from '../ui/SixDigitCodeInput'
import Modal from '../ui/Modal'
import CustomInput from '../ui/CustomInput'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'

interface EmailTwoFactorProps {
  isEnabled: boolean
  isPreferredMethod: boolean
  onStatusChange: () => void
}

const EmailTwoFactor: React.FC<EmailTwoFactorProps> = ({
  isEnabled,
  isPreferredMethod,
  onStatusChange,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEnableFlow, setShowEnableFlow] = useState(false)
  const [showDisableFlow, setShowDisableFlow] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    'config' | 'verify' | 'backup' | 'security'
  >('config')
  // Enable Flow
  const [canResend, setCanResend] = useState(false)
  // Step 2: Verification Code
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(''),
  )
  // Step 3: Backup Codes
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  // Disable flow
  // Step 1: Choose Method
  const [disableMethod, setDisableMethod] = useState<'otp' | 'password'>('otp')
  // Step 2: Enter Code or Password
  const [disableCode, setDisableCode] = useState<string[]>(Array(6).fill(''))
  const [disablePassword, setDisablePassword] = useState('')

  const { configureEmail, resendCode, enableEmail, disableEmail } =
    useEmailTwoFactor()
  const { setPreferredMethod } = useTwoFactorAuth()

  useEffect(() => {
    // Auto-submit when code is complete
    const codeValue = verificationCode.join('')
    if (codeValue.length === 6 && !isLoading) {
      handleVerifyCode()
    }
  }, [verificationCode])

  // Step 1: Send Verification code
  const handleEnable = async () => {
    setIsLoading(true)
    const success = await configureEmail()
    if (success) {
      setShowEnableFlow(true)
      setCurrentStep('verify')
    }
    setIsLoading(false)
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    await resendCode()
    setCanResend(false)
    setIsLoading(false)
  }

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    if (code.length !== 6) return

    setIsLoading(true)
    const result = await enableEmail(code)
    if (result?.success) {
      setBackupCodes(result.backupCodes || [])
      setCurrentStep('backup')
    }
    setIsLoading(false)
  }

  // Disable flow
  const handleDisable = async () => {
    setIsLoading(true)
    const value =
      disableMethod === 'otp' ? disableCode.join('') : disablePassword
    const success = await disableEmail(disableMethod, value)
    if (success) {
      setShowDisableFlow(false)
      onStatusChange()
    }
    setIsLoading(false)
  }

  const handleSetPreferredMethod = async () => {
    setIsLoading(true)
    const success = await setPreferredMethod('email')
    if (success) {
      onStatusChange()
    }
    setIsLoading(false)
  }

  // Flow completion
  const handleFlowComplete = () => {
    setShowEnableFlow(false)
    setCurrentStep('config')
    setVerificationCode(Array(6).fill(''))
    setBackupCodes([])
    onStatusChange()
  }

  const renderEnableFlow = () => {
    switch (currentStep) {
      case 'verify':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'>
                <Mail className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Vérifiez votre email
              </h3>
              <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                Entrez le code à 6 chiffres envoyé à votre adresse email
              </p>
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
                value={verificationCode}
                onChange={setVerificationCode}
                disabled={isLoading}
                error={!!error}
                autoFocus
              />
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
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier Indésirables
              ou{' '}
              <PrimaryButton
                variant='ghost'
                onClick={handleResendCode}
                loading={isLoading}
                disabled={!canResend || isLoading}
                icon={RefreshCw}
                className='mt-2'
              >
                Renvoyer un code
              </PrimaryButton>
            </div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleVerifyCode}
                loading={isLoading}
                disabled={verificationCode.join('').length !== 6}
                fullWidth
              >
                Vérifier le code
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={() => setShowEnableFlow(false)}
                fullWidth
              >
                Annuler
              </PrimaryButton>
            </div>
          </div>
        )

      case 'backup':
        return (
          <BackupCodesDisplay
            codes={backupCodes.map((code: any) => code.code)}
            onContinue={() => setCurrentStep('security')}
            onSkip={handleFlowComplete}
          />
        )

      case 'security':
        return (
          <SecurityQuestionsSetup
            onComplete={handleFlowComplete}
            onSkip={handleFlowComplete}
          />
        )

      default:
        return null
    }
  }

  const renderDisableFlow = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
          <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Désactiver la 2FA par email
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Choisissez votre méthode de vérification
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex space-x-4'>
          <button
            onClick={() => setDisableMethod('otp')}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'otp'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <Mail className='mx-auto mb-2 h-6 w-6' />
            <div className='text-sm font-medium'>Code par email</div>
          </button>
          <button
            onClick={() => setDisableMethod('password')}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'password'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <Shield className='mx-auto mb-2 h-6 w-6' />
            <div className='text-sm font-medium'>Mot de passe</div>
          </button>
        </div>

        {disableMethod === 'otp' ? (
          <SixDigitCodeInput
            value={disableCode}
            onChange={setDisableCode}
            disabled={isLoading}
            autoFocus
          />
        ) : (
          <CustomInput
            type='password'
            label='Mot de passe'
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            autoFocus
          />
        )}
      </div>

      <div className='flex space-x-3'>
        <PrimaryButton
          onClick={handleDisable}
          loading={isLoading}
          disabled={
            disableMethod === 'otp'
              ? disableCode.join('').length !== 6
              : !disablePassword
          }
          className='bg-red-600 hover:bg-red-700 text-white'
          fullWidth
        >
          Désactiver
        </PrimaryButton>
        <PrimaryButton
          variant='outline'
          onClick={() => setShowDisableFlow(false)}
          fullWidth
        >
          Annuler
        </PrimaryButton>
      </div>
    </div>
  )

  return (
    <>
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
            <Mail className='text-blue-600 dark:text-blue-400' size={20} />
          </div>
          <div>
            <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
              Email
            </h4>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Codes temporaires par email
            </p>
          </div>
        </div>

        <div className='flex items-center justify-between mb-4'>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              isEnabled
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isEnabled ? 'Activé' : 'Désactivé'}
          </span>
          {isEnabled && (
            <button
              className={`flex px-2 py-1 rounded-full text-xs ${
                isPreferredMethod
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              disabled={isLoading}
              {...(!isPreferredMethod && { onClick: handleSetPreferredMethod })}
            >
              {<Star className='mr-1 h-4 w-4' />}
              {isPreferredMethod
                ? 'Méthode préférée'
                : 'Choisir comme préférée'}
            </button>
          )}
        </div>

        <PrimaryButton
          variant={isEnabled ? 'secondary' : 'primary'}
          size='sm'
          fullWidth
          onClick={isEnabled ? () => setShowDisableFlow(true) : handleEnable}
          loading={isLoading}
        >
          {isEnabled ? 'Désactiver' : 'Activer'}
        </PrimaryButton>
      </div>

      <Modal
        isOpen={showEnableFlow}
        onClose={() => setShowEnableFlow(false)}
        title='Activer la 2FA par email'
        size='md'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        isOpen={showDisableFlow}
        onClose={() => setShowDisableFlow(false)}
        title='Désactiver la 2FA par email'
        size='md'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default EmailTwoFactor
