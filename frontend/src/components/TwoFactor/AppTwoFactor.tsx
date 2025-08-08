import React, { useState } from 'react'
import { Star, Smartphone, Copy, QrCode, AlertCircle } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import SixDigitCodeInput from '../ui/SixDigitCodeInput'
import Modal from '../ui/Modal'
import CustomInput from '../ui/CustomInput'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'
import useAppTwoFactor from '../../hooks/TwoFactor/App'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import { toast } from 'sonner'

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
  const [isLoading, setIsLoading] = useState(false)
  const [showEnableFlow, setShowEnableFlow] = useState(false)
  const [showDisableFlow, setShowDisableFlow] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    'config' | 'qr' | 'verify' | 'backup' | 'security'
  >('config')
  // Flow data
  // Step 1: QR Code and Secret
  const [qrData, setQrData] = useState<{
    secret: string
    qrCode: string
  } | null>(null)
  // Step 2: Verification Code
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(''),
  )
  // Step 3: Backup Codes
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  // Disable flow
  const [disableCode, setDisableCode] = useState<string[]>(Array(6).fill(''))
  const [disablePassword, setDisablePassword] = useState('')
  const [requirePassword, setRequirePassword] = useState(false)

  const { configureApp, enableApp, disableApp } = useAppTwoFactor()
  const { setPreferredMethod } = useTwoFactorAuth()

  // Step 1 : Request QR Code and Secret
  const handleEnable = async () => {
    setIsLoading(true)
    const result = await configureApp()
    if (result?.secret && result?.qrCode) {
      setQrData({
        secret: result.secret,
        qrCode: result.qrCode,
      })
      setShowEnableFlow(true)
      setCurrentStep('qr')
    }
    setIsLoading(false)
  }

  // Copy secret to clipboard
  const handleCopySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret)
      toast.success('Clé copiée dans le presse-papiers')
    }
  }

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    if (code.length !== 6) return

    setIsLoading(true)
    const result = await enableApp(code)
    if (result?.success) {
      setBackupCodes(result.backupCodes || [])
      setCurrentStep('backup')
    }
    setIsLoading(false)
  }

  // Disable flow
  const handleDisable = async () => {
    const code = disableCode.join('')
    if (code.length !== 6) return

    setIsLoading(true)
    const success = await disableApp(
      code,
      requirePassword ? disablePassword : undefined,
    )
    if (success) {
      setShowDisableFlow(false)
      onStatusChange()
    }
    setIsLoading(false)
  }

  const handleSetPreferredMethod = async () => {
    setIsLoading(true)
    const success = await setPreferredMethod('app')
    if (success) {
      onStatusChange()
    }
    setIsLoading(false)
  }

  // Handle flow completion
  const handleFlowComplete = () => {
    setShowEnableFlow(false)
    setCurrentStep('config')
    setVerificationCode(Array(6).fill(''))
    setBackupCodes([])
    setQrData(null)
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

            {qrData?.qrCode && (
              <div className='flex justify-center'>
                <div className='p-1 bg-white rounded-lg border'>
                  <img
                    src={qrData.qrCode}
                    alt='QR Code'
                    className='w-48 h-48'
                  />
                </div>
              </div>
            )}

            <div className='space-y-3'>
              <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                Ou entrez cette clé manuellement :
              </p>
              <div className='flex items-center space-x-2'>
                <code className='flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono break-all'>
                  {qrData?.secret}
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

            <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4'>
              <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-2'>
                Applications recommandées :
              </h4>
              <ul className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
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
              onChange={setVerificationCode}
              disabled={isLoading}
              autoFocus
            />

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
          Désactiver la 2FA par application
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Entrez le code généré par votre application d'authentification
        </p>
      </div>

      <SixDigitCodeInput
        value={disableCode}
        onChange={setDisableCode}
        disabled={isLoading}
        autoFocus
      />

      <div className='space-y-3'>
        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={requirePassword}
            onChange={(e) => setRequirePassword(e.target.checked)}
            className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
          />
          <span className='text-sm text-gray-700 dark:text-gray-300'>
            Confirmer avec le mot de passe (sécurité renforcée)
          </span>
        </label>

        {requirePassword && (
          <CustomInput
            type='password'
            label='Mot de passe'
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
          />
        )}
      </div>

      <div className='flex space-x-3'>
        <PrimaryButton
          onClick={handleDisable}
          loading={isLoading}
          disabled={
            disableCode.join('').length !== 6 ||
            (requirePassword && !disablePassword)
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
          <div className='p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg'>
            <Smartphone
              className='text-yellow-600 dark:text-yellow-400'
              size={20}
            />
          </div>
          <div>
            <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
              Application
            </h4>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Google Authenticator, Authy
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
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
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
        title='Activer la 2FA par application'
        size='lg'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        isOpen={showDisableFlow}
        onClose={() => setShowDisableFlow(false)}
        title='Désactiver la 2FA par application'
        size='md'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default AppTwoFactor
