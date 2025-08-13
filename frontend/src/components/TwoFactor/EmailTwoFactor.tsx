import { AlertCircle, Mail, RefreshCw, Shield, Star } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'

import { useAuth } from '../../context/Auth'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import { useUrlModal } from '../../routes/UseUrlModal'
import CountdownTimer from '../ui/CountdownTimer'
import CustomInput from '../ui/CustomInput'
import ErrorMessage from '../ui/ErrorMessage'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import SixDigitCodeInput from '../ui/SixDigitCodeInput'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'

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
  const { user } = useAuth()

  // States UI spécifiques
  const { open: openEnableFlow, close: closeEnableFlow } =
    useUrlModal('enable-email-2fa')
  const { open: openDisableFlow, close: closeDisableFlow } =
    useUrlModal('disable-email-2fa')
  const [currentStep, setCurrentStep] = useState<
    'config' | 'verify' | 'backup' | 'security'
  >('config')
  const [canResend, setCanResend] = useState(false)
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(''),
  )
  const [disableMethod, setDisableMethod] = useState<'otp' | 'password'>('otp')
  const [disableCode, setDisableCode] = useState<string[]>(Array(6).fill(''))
  const [disablePassword, setDisablePassword] = useState('')

  // Hooks API
  const {
    configureEmail,
    configureEmailState,
    resendCode,
    resendCodeState,
    enableEmail,
    enableEmailState,
    disableEmail,
    disableEmailState,
  } = useEmailTwoFactor()

  const { setPreferredMethod, setPreferredMethodState } = useTwoFactorAuth()

  // Step 1: Send Verification code
  const handleEnable = async () => {
    configureEmailState.resetError()
    const result = await configureEmail()
    if (result.success) {
      openEnableFlow()
      setCurrentStep('verify')
    }
  }

  const handleResendCode = async (method: 'config' | 'disable') => {
    resendCodeState.resetError()
    const result = await resendCode(user?.email, method)
    if (result.success) {
      setCanResend(false)
    }
  }

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    enableEmailState.resetError()
    const result = await enableEmail(verificationCode.join(''))
    if (result.success) {
      setCurrentStep('backup')
    }
  }

  // Disable flow
  const handleDisable = async () => {
    disableEmailState.resetError()
    const value =
      disableMethod === 'otp' ? disableCode.join('') : disablePassword
    const result = await disableEmail(disableMethod, value)
    if (result.success) {
      closeDisableFlow()
      onStatusChange()
    }
  }

  const handleSetPreferredMethod = async () => {
    const result = await setPreferredMethod('email')
    if (result.success) {
      onStatusChange()
    }
  }

  // Flow completion
  const handleFlowComplete = () => {
    closeEnableFlow()
    setCurrentStep('config')
    setVerificationCode(Array(6).fill(''))
    enableEmailState.resetData()
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

            {enableEmailState.error && (
              <ErrorMessage
                message={enableEmailState.error}
                type='error'
                onClose={() => enableEmailState.resetError()}
              />
            )}
            <div className='space-y-4'>
              <SixDigitCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
                disabled={enableEmailState.loading}
                error={!!enableEmailState.error}
                onComplete={() => handleVerifyCode()}
                autoFocus
              />
            </div>
            {!canResend ? (
              <div className='space-y-2 text-center'>
                <CountdownTimer
                  initialSeconds={60}
                  onComplete={() => setCanResend(true)}
                  className='justify-center'
                />
              </div>
            ) : (
              <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                Vous n'avez pas reçu l'email ? Vérifiez votre dossier
                Indésirables ou{' '}
                <PrimaryButton
                  variant='ghost'
                  onClick={() => handleResendCode('config')}
                  loading={resendCodeState.loading}
                  disabled={!canResend || resendCodeState.loading}
                  icon={RefreshCw}
                  className='mt-2'
                >
                  Renvoyer un code
                </PrimaryButton>
              </div>
            )}

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleVerifyCode}
                loading={enableEmailState.loading}
                disabled={verificationCode.join('').length !== 6}
                fullWidth
              >
                Vérifier le code
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={closeEnableFlow}
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
            codes={enableEmailState.data.backupCodes.map(
              (code: any) => code.code,
            )}
            onContinue={() => setCurrentStep('security')}
            onSkip={handleFlowComplete}
            isModal
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
            <Mail className='mx-auto mb-2 h-6 w-6 text-gray-900 dark:text-gray-400' />
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400'>
              Code par email
            </div>
          </button>
          <button
            onClick={() => setDisableMethod('password')}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'password'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <Shield className='mx-auto mb-2 h-6 w-6 text-gray-900 dark:text-gray-400' />
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400'>
              Mot de passe
            </div>
          </button>
        </div>

        {disableEmailState.error && (
          <ErrorMessage
            message={disableEmailState.error}
            type='error'
            onClose={() => disableEmailState.resetError()}
          />
        )}
        {disableMethod === 'otp' ? (
          <div className='space-y-6'>
            {enableEmailState.error && (
              <ErrorMessage
                message={enableEmailState.error}
                type='error'
                onClose={() => enableEmailState.resetError()}
              />
            )}
            <div className='space-y-4'>
              <SixDigitCodeInput
                value={disableCode}
                onChange={setDisableCode}
                disabled={disableEmailState.loading}
                error={!!disableEmailState.error}
                onComplete={() => handleDisable()}
                autoFocus
              />
            </div>
            {!canResend ? (
              <div className='space-y-2 text-center'>
                <CountdownTimer
                  initialSeconds={60}
                  onComplete={() => setCanResend(true)}
                  className='justify-center'
                />
              </div>
            ) : (
              <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                Vous n'avez pas reçu l'email ? Vérifiez votre dossier
                Indésirables ou{' '}
                <PrimaryButton
                  variant='ghost'
                  onClick={() => handleResendCode('config')}
                  loading={resendCodeState.loading}
                  disabled={!canResend || resendCodeState.loading}
                  icon={RefreshCw}
                  className='mt-2'
                >
                  Renvoyer un code
                </PrimaryButton>
              </div>
            )}
          </div>
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
          variant='danger'
          loading={disableEmailState.loading}
          disabled={
            disableMethod === 'otp'
              ? disableCode.join('').length !== 6
              : !disablePassword
          }
          fullWidth
        >
          Désactiver
        </PrimaryButton>
        <PrimaryButton variant='outline' onClick={closeDisableFlow} fullWidth>
          Annuler
        </PrimaryButton>
      </div>
    </div>
  )

  return (
    <>
      <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 flex items-center space-x-3'>
          <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20'>
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

        <div className='mb-4 flex flex-col space-y-2 min-[320px]:flex-row items-center min-[320px]:justify-between'>
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              isEnabled
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isEnabled ? 'Activé' : 'Désactivé'}
          </span>
          {isEnabled && (
            <button
              className={`flex rounded-full px-2 py-1 text-xs ${
                isPreferredMethod
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              disabled={setPreferredMethodState.loading}
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
          onClick={
            isEnabled
              ? () => {
                  ;(openDisableFlow(), resendCode(user?.email || '', 'disable'))
                }
              : handleEnable
          }
          loading={
            isEnabled ? disableEmailState.loading : configureEmailState.loading
          }
        >
          {isEnabled ? 'Désactiver' : 'Activer'}
        </PrimaryButton>
      </div>

      <Modal
        onClose={closeEnableFlow}
        title='Activer la 2FA par email'
        size='md'
        urlName='enable-email-2fa'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        onClose={closeDisableFlow}
        title='Désactiver la 2FA par email'
        size='md'
        urlName='disable-email-2fa'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default EmailTwoFactor
