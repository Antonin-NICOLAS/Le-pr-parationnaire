import { AlertCircle, Copy, QrCode, Shield, Smartphone } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

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

  // Step 1 : Request QR Code and Secret
  const handleEnable = async () => {
    configureAppState.resetError()
    const result = await configureApp()
    if (result.success) {
      openEnableFlow()
      setCurrentStep('qr')
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
      setCurrentStep('backup')
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
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                <QrCode className='h-8 w-8 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Scannez le QR Code
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Utilisez votre application d'authentification pour scanner ce
                code
              </p>
            </div>

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

            <div className='space-y-3'>
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
            </div>

            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20'>
              <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                Applications recommandées :
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>• Google Authenticator</li>
                <li>• Authy</li>
                <li>• Microsoft Authenticator</li>
                <li>• Apple Passwords (iOS 15+)</li>
              </ul>
            </div>

            <PrimaryButton onClick={() => setCurrentStep('verify')} fullWidth>
              Continuer
            </PrimaryButton>
          </div>
        )

      case 'verify':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                <Smartphone className='h-8 w-8 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Vérifiez votre application
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Entrez le code à 6 chiffres généré par votre application
              </p>
            </div>

            <SixDigitCodeInput
              value={verificationCode}
              onComplete={handleVerifyCode}
              onChange={setVerificationCode}
              loading={enableAppState.loading}
              disabled={enableAppState.loading}
              autoFocus
            />

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
                onClick={() => setCurrentStep('qr')}
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
          Désactiver la 2FA par application
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Choisissez votre méthode de vérification
        </p>
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
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
        </div>

        <ErrorMessage
          message={disableAppState.error}
          type='error'
          onClose={() => disableAppState.resetError()}
          isVisible={!!disableAppState.error}
        />

        {disableMethod === 'otp' ? (
          <SixDigitCodeInput
            value={disableCode}
            onChange={setDisableCode}
            disabled={disableAppState.loading}
            loading={disableAppState.loading}
            onComplete={() => handleDisable()}
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
        {renderEnableFlow()}
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
