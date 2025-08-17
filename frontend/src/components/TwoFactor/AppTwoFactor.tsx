import { AlertCircle, Copy, QrCode, Shield, Smartphone } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

import useAppTwoFactor from '../../hooks/TwoFactor/App'
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

interface AppTwoFactorProps {
  isEnabled: boolean
  isPreferredMethod: boolean
  onStatusChange: () => void
}
const AppTwoFactor: React.FC<AppTwoFactorProps> = ({
  isEnabled,
  isPreferredMethod,
  onStatusChange,
}) => {
  const { open: openEnableFlow, close: closeEnableFlow } =
    useUrlModal('enable-app-2fa')
  const { open: openDisableFlow, close: closeDisableFlow } =
    useUrlModal('disable-app-2fa')
  const [currentStep, setCurrentStep] = useState<
    'config' | 'qr' | 'verify' | 'backup' | 'security'
  >('config')
  const [direction, setDirection] = useState(1)
  // Step 2: Verification Code
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(''),
  )
  // Disable flow
  const [disableMethod, setDisableMethod] = useState<'otp' | 'password'>('otp')
  const [disableCode, setDisableCode] = useState<string[]>(Array(6).fill(''))
  const [disablePassword, setDisablePassword] = useState('')

  const {
    configureApp,
    configureAppState,
    enableApp,
    enableAppState,
    disableApp,
    disableAppState,
  } = useAppTwoFactor()
  const { setPreferredMethod, setPreferredMethodState } = useTwoFactorAuth()

  const changeStep = (newStep: typeof currentStep) => {
    const steps = ['config', 'qr', 'verify', 'backup', 'security']
    setDirection(steps.indexOf(newStep) > steps.indexOf(currentStep) ? 1 : -1)
    setCurrentStep(newStep)
  }

  // Step 1 : Request QR Code and Secret
  const handleEnable = async () => {
    configureAppState.resetError()
    const result = await configureApp()
    if (result.success) {
      openEnableFlow()
      changeStep('qr')
    }
  }

  // Copy secret to clipboard
  const handleCopySecret = () => {
    if (configureAppState.data?.secret) {
      navigator.clipboard.writeText(configureAppState.data.secret)
      toast.success('Clé copiée dans le presse-papiers')
    }
  }

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    enableAppState.resetError()
    const code = verificationCode.join('')
    if (code.length !== 6) return

    const result = await enableApp(code)
    if (result.success) {
      changeStep('backup')
    }
  }

  // Disable flow
  const handleDisable = async () => {
    disableAppState.resetError()
    const value =
      disableMethod === 'otp' ? disableCode.join('') : disablePassword
    const result = await disableApp(disableMethod, value)
    if (result.success) {
      closeDisableFlow()
      onStatusChange()
    }
  }

  const handleSetPreferredMethod = async () => {
    const result = await setPreferredMethod('app')
    if (result.success) {
      onStatusChange()
    }
  }

  // Handle flow completion
  const handleFlowComplete = () => {
    closeEnableFlow()
    setCurrentStep('config')
    setVerificationCode(Array(6).fill(''))
    enableAppState.resetData()
    onStatusChange()
  }

  const renderEnableFlow = () => {
    switch (currentStep) {
      case 'qr':
        return (
          <motion.div
            className='space-y-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <QrCode className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Scannez le QR Code
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Utilisez votre application d'authentification pour scanner ce
                code
              </p>
            </div>

            <ErrorMessage
              message={configureAppState.error}
              type='error'
              onClose={() => {
                configureAppState.resetError()
              }}
              isVisible={!!configureAppState.error}
            />

            {configureAppState.data.qrCode && (
              <div className='flex justify-center'>
                <div className='rounded-lg border bg-white p-1'>
                  <img
                    src={configureAppState.data.qrCode || '/placeholder.svg'}
                    alt='QR Code'
                    className='h-48 w-48'
                  />
                </div>
              </div>
            )}

            <motion.div
              className='space-y-3'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                Ou entrez cette clé manuellement :
              </p>
              <div className='flex items-center space-x-2'>
                <code className='flex-1 break-all rounded-lg bg-gray-100 p-3 font-mono text-sm dark:bg-gray-700'>
                  {configureAppState.data.secret}
                </code>
                <PrimaryButton
                  variant='outline'
                  size='sm'
                  onClick={handleCopySecret}
                  icon={Copy}
                >
                  Copier
                </PrimaryButton>
              </div>
            </motion.div>

            <motion.div
              className='text-center'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ErrorMessage
                title='Applications recommandées :'
                message={
                  <ul className='space-y-1'>
                    <li>• Google Authenticator</li>
                    <li>• Authy</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Apple Passwords (iOS 15+)</li>
                  </ul>
                }
                type='info'
              />
            </motion.div>

            <PrimaryButton onClick={() => changeStep('verify')} fullWidth>
              Continuer
            </PrimaryButton>
          </motion.div>
        )

      case 'verify':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Smartphone className='h-8 w-8 text-green-600 dark:text-green-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Vérifiez votre application
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Entrez le code à 6 chiffres généré par votre application
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SixDigitCodeInput
                value={verificationCode}
                onComplete={handleVerifyCode}
                onChange={setVerificationCode}
                loading={enableAppState.loading}
                disabled={enableAppState.loading}
                autoFocus
              />
            </motion.div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleVerifyCode}
                loading={enableAppState.loading}
                disabled={verificationCode.join('').length !== 6}
                fullWidth
              >
                Vérifier le code
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={() => changeStep('qr')}
                fullWidth
              >
                Retour
              </PrimaryButton>
            </div>
          </div>
        )

      case 'backup':
        return (
          <BackupCodesDisplay
            codes={enableAppState.data.backupCodes.map(
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
          Désactiver la 2FA par application
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
            icon={Smartphone}
            title='Application'
            description='Code 2FA'
            color='yellow'
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
          message={disableAppState.error}
          type='error'
          onClose={() => disableAppState.resetError()}
          isVisible={!!disableAppState.error}
        />

        <AnimatePresence mode='wait'>
          {disableMethod === 'otp' ? (
            <motion.div
              key='otp-input'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SixDigitCodeInput
                value={disableCode}
                onChange={setDisableCode}
                disabled={disableAppState.loading}
                loading={disableAppState.loading}
                onComplete={() => handleDisable()}
                autoFocus
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
          loading={disableAppState.loading}
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
        icon={Smartphone}
        iconColor='yellow'
        title='Application'
        description='Google Authenticator, Authy'
        isEnabled={isEnabled}
        isPreferred={isPreferredMethod}
        onToggle={isEnabled ? openDisableFlow : handleEnable}
        onSetPreferred={handleSetPreferredMethod}
        toggleLoading={
          isEnabled ? disableAppState.loading : configureAppState.loading
        }
        preferredLoading={setPreferredMethodState.loading}
      />

      <Modal
        onClose={closeEnableFlow}
        title='Activer la 2FA par application'
        size='lg'
        urlName='enable-app-2fa'
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
        title='Désactiver la 2FA par application'
        size='md'
        urlName='disable-app-2fa'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default AppTwoFactor
