import { AlertCircle, Mail, Shield } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '../../context/Auth'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import { useUrlModal } from '../../routes/UseUrlModal'
import CustomInput from '../ui/CustomInput'
import ErrorMessage from '../ui/ErrorMessage'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import SixDigitCodeInput from '../ui/SixDigitCodeInput'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'
import TwoFactorMethodCard from './TwoFactorMethodCard'
import MethodSelectionCard from './MethodSelectionCard'
import ResendSection from '../ui/ResendSection'

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
  const [direction, setDirection] = useState(1)
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

  const changeStep = (newStep: typeof currentStep) => {
    const steps = ['config', 'verify', 'backup', 'security']
    setDirection(steps.indexOf(newStep) > steps.indexOf(currentStep) ? 1 : -1)
    setCurrentStep(newStep)
  }

  // Step 1: Send Verification code
  const handleEnable = async () => {
    configureEmailState.resetError()
    const result = await configureEmail()
    if (result.success) {
      openEnableFlow()
      changeStep('verify')
    }
  }

  const handleResendCode = async (method: 'config' | 'disable') => {
    resendCodeState.resetError()
    await resendCode(user?.email, method)
  }

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    enableEmailState.resetError()
    const result = await enableEmail(verificationCode.join(''))
    if (result.success) {
      changeStep('backup')
      onStatusChange()
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
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Mail className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Vérification par Email
              </h3>
              <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                Entrez le code à 6 chiffres envoyé à votre adresse email
              </p>
            </div>

            <ErrorMessage
              message={enableEmailState.error}
              type='error'
              onClose={() => enableEmailState.resetError()}
              isVisible={!!enableEmailState.error}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SixDigitCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
                disabled={enableEmailState.loading}
                error={!!enableEmailState.error}
                onComplete={() => handleVerifyCode()}
                autoFocus
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ResendSection
                countdownSeconds={60}
                onResend={() => handleResendCode('config')}
                loading={resendCodeState.loading}
                align='center'
              />
            </motion.div>

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
            onContinue={() => changeStep('security')}
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
        <motion.div
          className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
        </motion.div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Désactiver la 2FA par email
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Choisissez votre méthode de vérification
        </p>
      </div>

      <div className='space-y-4'>
        <motion.div
          className='grid grid-cols-2 gap-3'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MethodSelectionCard
            icon={Mail}
            title='Code par email'
            description='Code 2FA'
            color='blue'
            isSelected={disableMethod === 'otp'}
            onClick={() => setDisableMethod('otp')}
            layout='vertical'
            showChevron={false}
          />
          <MethodSelectionCard
            icon={Shield}
            title='Mot de passe'
            description='Votre mot de passe'
            color='orange'
            isSelected={disableMethod === 'password'}
            onClick={() => setDisableMethod('password')}
            layout='vertical'
            showChevron={false}
          />
        </motion.div>

        <ErrorMessage
          message={disableEmailState.error}
          type='error'
          onClose={() => disableEmailState.resetError()}
          isVisible={!!disableEmailState.error}
        />

        <AnimatePresence mode='wait'>
          {disableMethod === 'otp' ? (
            <motion.div
              key='otp-section'
              className='space-y-4'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SixDigitCodeInput
                value={disableCode}
                onChange={setDisableCode}
                disabled={disableEmailState.loading}
                error={!!disableEmailState.error}
                onComplete={() => handleDisable()}
                autoFocus
              />

              <ResendSection
                message="Vous n'avez pas reçu l'email ? Vérifiez votre dossier Indésirables ou"
                countdownSeconds={60}
                onResend={() => handleResendCode('disable')}
                loading={resendCodeState.loading}
                buttonText='Renvoyer un code'
                align='center'
              />
            </motion.div>
          ) : (
            <motion.div
              key='password-input'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CustomInput
                type='password'
                label='Mot de passe'
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
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
      <TwoFactorMethodCard
        icon={Mail}
        iconColor='blue'
        title='Email'
        description='Codes temporaires par email'
        isEnabled={isEnabled}
        isPreferred={isPreferredMethod}
        onToggle={
          isEnabled
            ? () => {
                openDisableFlow()
                resendCode(user?.email || '', 'disable')
              }
            : handleEnable
        }
        onSetPreferred={handleSetPreferredMethod}
        toggleLoading={
          isEnabled ? disableEmailState.loading : configureEmailState.loading
        }
        preferredLoading={setPreferredMethodState.loading}
      />

      <Modal
        onClose={closeEnableFlow}
        title='Activer la 2FA par email'
        size='md'
        urlName='enable-email-2fa'
      >
        <AnimatePresence custom={direction} mode='wait'>
          <motion.div
            key={currentStep}
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
          >
            {renderEnableFlow()}
          </motion.div>
        </AnimatePresence>
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
