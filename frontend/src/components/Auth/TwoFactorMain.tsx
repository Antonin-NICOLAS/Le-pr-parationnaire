import React, { useState } from 'react'
import {
  Key,
  Shield,
  Mail,
  Smartphone,
  Fingerprint,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import ToggleSwitch from '../ui/ToggleSwitch'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import ErrorMessage from '../ui/ErrorMessage'
import SixDigitCodeInput from '../ui/SixDigitCodeInput'
import CustomInput from '../ui/CustomInput'
import { useAuth } from '../../context/Auth'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import useAppTwoFactor from '../../hooks/TwoFactor/App'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import useSecurityQuestions from '../../hooks/TwoFactor/SecurityQuestions'
import { useUrlModal } from '../../routes/UseUrlModal'
import BackupCodesDisplay from '../TwoFactor/BackupCodesDisplay'
import type { SecurityQuestion, WebAuthnCredential } from '../../types/user'

interface TwoFactorMainProps {
  isEnabled: boolean
  availableMethods: ('email' | 'app' | 'webauthn')[]
  primaryCredentials: WebAuthnCredential[]
  onStatusChange: () => void
}

const TwoFactorMain: React.FC<TwoFactorMainProps> = ({
  isEnabled,
  availableMethods = ['email', 'app', 'webauthn'],
  primaryCredentials,
  onStatusChange,
}) => {
  const { user } = useAuth()
  const { open: openEnableFlow, close: closeEnableFlow } =
    useUrlModal('enable-2fa-main')
  const { open: openDisableFlow, close: closeDisableFlow } =
    useUrlModal('disable-2fa-main')

  const [enableStep, setEnableStep] = useState<
    'info' | 'method' | 'config' | 'backup'
  >('info')
  const [disableStep, setDisableStep] = useState<'method' | 'verify'>('method')
  const [selectedMethod, setSelectedMethod] = useState<
    'email' | 'app' | 'webauthn'
  >('email')
  const [disableMethod, setDisableMethod] = useState<
    'email' | 'app' | 'webauthn' | 'backup' | 'security'
  >('email')

  // Form states
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(''),
  )
  const [disablePassword, setDisablePassword] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [securityAnswers, setSecurityAnswers] = useState<
    { questionId: string; answer: string }[]
  >([])
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([])

  // Hooks
  const { twoFactorLogin } = useTwoFactorAuth()
  const { configureEmail, enableEmail, configureEmailState, enableEmailState } =
    useEmailTwoFactor()
  const { configureApp, enableApp, configureAppState, enableAppState } =
    useAppTwoFactor()
  const {
    registerDevice,
    authenticate,
    registerDeviceState,
    authenticateState,
  } = useWebAuthnTwoFactor()
  const { getAvailableQuestions, verifySecurityQuestions } =
    useSecurityQuestions()

  const handleEnable = () => {
    setEnableStep('info')
    openEnableFlow()
  }

  const handleDisable = () => {
    setDisableStep('method')
    openDisableFlow()
  }

  const handleMethodSelection = async () => {
    setEnableStep('config')

    // Configure selected method
    switch (selectedMethod) {
      case 'email':
        await configureEmail()
        break
      case 'app':
        await configureApp()
        break
      case 'webauthn':
        // Check if primary credentials exist for cloning option
        if (primaryCredentials.length > 0) {
          // Show cloning option modal or directly register
        }
        await registerDevice('secondary')
        break
    }
  }

  const handleMethodVerification = async () => {
    const code = verificationCode.join('')
    let result

    switch (selectedMethod) {
      case 'email':
        result = await enableEmail(code)
        break
      case 'app':
        result = await enableApp(code)
        break
      case 'webauthn':
        // WebAuthn doesn't need code verification
        result = { success: true }
        break
    }

    if (result.success) {
      setEnableStep('backup')
    }
  }

  const handleDisableVerification = async () => {
    let result

    switch (disableMethod) {
      case 'email':
      case 'app':
        const code = verificationCode.join('')
        result = await twoFactorLogin(
          user?.email || '',
          false,
          disableMethod,
          code,
        )
        break
      case 'webauthn':
        result = await authenticate('secondary', user?.email || '', false)
        break
      case 'backup':
        result = await twoFactorLogin(
          user?.email || '',
          false,
          'backup_code',
          backupCode,
        )
        break
      case 'security':
        const success = await verifySecurityQuestions(securityAnswers)
        result = { success }
        break
    }

    if (result.success) {
      // Disable all 2FA methods
      closeDisableFlow()
      onStatusChange()
    }
  }

  const loadSecurityQuestions = async () => {
    const questions = await getAvailableQuestions()
    setSecurityQuestions(questions.slice(0, 2))
    setSecurityAnswers(
      questions.slice(0, 2).map((q) => ({ questionId: q.id, answer: '' })),
    )
  }

  const renderEnableFlow = () => {
    switch (enableStep) {
      case 'info':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
                <Shield className='h-8 w-8 text-primary-600 dark:text-primary-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Activer la double authentification
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Renforcez la sécurité de votre compte
              </p>
            </div>

            <ErrorMessage
              type='info'
              title="Qu'est-ce que la double authentification ?"
              message="La 2FA ajoute une couche de sécurité supplémentaire en demandant un second facteur d'authentification après votre mot de passe."
            />

            <ErrorMessage
              type='warning'
              title='Important'
              message="Assurez-vous d'avoir accès à votre méthode choisie avant d'activer la 2FA. Vous recevrez des codes de secours pour éviter d'être bloqué."
            />

            <PrimaryButton onClick={() => setEnableStep('method')} fullWidth>
              Continuer
            </PrimaryButton>
          </div>
        )

      case 'method':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Choisissez votre méthode
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Sélectionnez comment vous souhaitez recevoir vos codes de
                vérification
              </p>
            </div>

            <div className='space-y-3'>
              {availableMethods.includes('email') && (
                <button
                  onClick={() => setSelectedMethod('email')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedMethod === 'email'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <Mail className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                    <div>
                      <div className='font-medium text-gray-900 dark:text-gray-100'>
                        Email
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        Codes temporaires par email
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {availableMethods.includes('app') && (
                <button
                  onClick={() => setSelectedMethod('app')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedMethod === 'app'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <Smartphone className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
                    <div>
                      <div className='font-medium text-gray-900 dark:text-gray-100'>
                        Application
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        Google Authenticator, Authy
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {availableMethods.includes('webauthn') && (
                <button
                  onClick={() => setSelectedMethod('webauthn')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedMethod === 'webauthn'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <Fingerprint className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                    <div>
                      <div className='font-medium text-gray-900 dark:text-gray-100'>
                        Clé de sécurité
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        WebAuthn, FaceID, TouchID
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div className='flex space-x-3'>
              <PrimaryButton onClick={handleMethodSelection} fullWidth>
                Configurer{' '}
                {selectedMethod === 'email'
                  ? 'Email'
                  : selectedMethod === 'app'
                    ? 'Application'
                    : 'Clé de sécurité'}
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={() => setEnableStep('info')}
                fullWidth
              >
                Retour
              </PrimaryButton>
            </div>
          </div>
        )

      case 'config':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Configuration{' '}
                {selectedMethod === 'email'
                  ? 'Email'
                  : selectedMethod === 'app'
                    ? 'Application'
                    : 'WebAuthn'}
              </h3>
            </div>

            {selectedMethod === 'email' && (
              <div className='space-y-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Entrez le code envoyé à votre adresse email
                </p>
                <SixDigitCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                />
              </div>
            )}

            {selectedMethod === 'app' && configureAppState.data?.qrCode && (
              <div className='space-y-4'>
                <div className='text-center'>
                  <img
                    src={configureAppState.data.qrCode}
                    alt='QR Code'
                    className='mx-auto h-48 w-48 rounded-lg border bg-white p-2'
                  />
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Scannez ce QR code avec votre application d'authentification,
                  puis entrez le code généré
                </p>
                <SixDigitCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                />
              </div>
            )}

            {selectedMethod === 'webauthn' && (
              <div className='space-y-4 text-center'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Votre clé de sécurité a été enregistrée avec succès
                </p>
                <PrimaryButton
                  onClick={() => setEnableStep('backup')}
                  fullWidth
                >
                  Continuer
                </PrimaryButton>
              </div>
            )}

            {selectedMethod !== 'webauthn' && (
              <PrimaryButton
                onClick={handleMethodVerification}
                disabled={verificationCode.join('').length !== 6}
                loading={enableEmailState.loading || enableAppState.loading}
                fullWidth
              >
                Vérifier
              </PrimaryButton>
            )}
          </div>
        )

      case 'backup':
        return (
          <BackupCodesDisplay
            codes={
              enableEmailState.data?.backupCodes?.map((c: any) => c.code) ||
              enableAppState.data?.backupCodes?.map((c: any) => c.code) ||
              registerDeviceState.data?.backupCodes?.map((c: any) => c.code) ||
              []
            }
            onContinue={() => {
              closeEnableFlow()
              onStatusChange()
            }}
            onSkip={() => {
              closeEnableFlow()
              onStatusChange()
            }}
            isModal
          />
        )

      default:
        return null
    }
  }

  const renderDisableFlow = () => {
    switch (disableStep) {
      case 'method':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
                <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Désactiver la double authentification
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Choisissez votre méthode de vérification
              </p>
            </div>

            <ErrorMessage
              type='warning'
              title='Attention'
              message="Désactiver la 2FA réduira la sécurité de votre compte. Assurez-vous que c'est vraiment ce que vous souhaitez faire."
            />

            <div className='grid grid-cols-2 gap-3'>
              {availableMethods.includes('email') && (
                <button
                  onClick={() => setDisableMethod('email')}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    disableMethod === 'email'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Mail className='mx-auto mb-2 h-6 w-6' />
                  <div className='text-sm font-medium'>Email</div>
                </button>
              )}

              {availableMethods.includes('app') && (
                <button
                  onClick={() => setDisableMethod('app')}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    disableMethod === 'app'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Smartphone className='mx-auto mb-2 h-6 w-6' />
                  <div className='text-sm font-medium'>Application</div>
                </button>
              )}

              {availableMethods.includes('webauthn') && (
                <button
                  onClick={() => setDisableMethod('webauthn')}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    disableMethod === 'webauthn'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Fingerprint className='mx-auto mb-2 h-6 w-6' />
                  <div className='text-sm font-medium'>Clé de sécurité</div>
                </button>
              )}

              <button
                onClick={() => setDisableMethod('backup')}
                className={`rounded-lg border-2 p-4 transition-all ${
                  disableMethod === 'backup'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                }`}
              >
                <Key className='mx-auto mb-2 h-6 w-6' />
                <div className='text-sm font-medium'>Code de secours</div>
              </button>

              <button
                onClick={() => {
                  setDisableMethod('security')
                  loadSecurityQuestions()
                }}
                className={`rounded-lg border-2 p-4 transition-all ${
                  disableMethod === 'security'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                }`}
              >
                <Shield className='mx-auto mb-2 h-6 w-6' />
                <div className='text-sm font-medium'>Questions de sécurité</div>
              </button>
            </div>

            <PrimaryButton onClick={() => setDisableStep('verify')} fullWidth>
              Continuer
            </PrimaryButton>
          </div>
        )

      case 'verify':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Vérification -{' '}
                {disableMethod === 'email'
                  ? 'Email'
                  : disableMethod === 'app'
                    ? 'Application'
                    : disableMethod === 'webauthn'
                      ? 'Clé de sécurité'
                      : disableMethod === 'backup'
                        ? 'Code de secours'
                        : 'Questions de sécurité'}
              </h3>
            </div>

            {(disableMethod === 'email' || disableMethod === 'app') && (
              <SixDigitCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
                autoFocus
              />
            )}

            {disableMethod === 'webauthn' && (
              <div className='text-center'>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                  Utilisez votre clé de sécurité pour confirmer
                </p>
                <PrimaryButton onClick={handleDisableVerification} fullWidth>
                  Utiliser la clé de sécurité
                </PrimaryButton>
              </div>
            )}

            {disableMethod === 'backup' && (
              <CustomInput
                label='Code de secours'
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder='Entrez un code de secours'
                autoFocus
              />
            )}

            {disableMethod === 'security' && (
              <div className='space-y-4'>
                {securityQuestions.map((question, index) => (
                  <div key={question.id}>
                    <label className='block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2'>
                      {question.question}
                    </label>
                    <CustomInput
                      value={securityAnswers[index]?.answer || ''}
                      onChange={(e) => {
                        const newAnswers = [...securityAnswers]
                        newAnswers[index] = {
                          ...newAnswers[index],
                          answer: e.target.value,
                        }
                        setSecurityAnswers(newAnswers)
                      }}
                      placeholder='Votre réponse'
                    />
                  </div>
                ))}
              </div>
            )}

            {disableMethod !== 'webauthn' && (
              <div className='flex space-x-3'>
                <PrimaryButton
                  onClick={handleDisableVerification}
                  disabled={
                    ((disableMethod === 'email' || disableMethod === 'app') &&
                      verificationCode.join('').length !== 6) ||
                    (disableMethod === 'backup' && !backupCode) ||
                    (disableMethod === 'security' &&
                      securityAnswers.some((a) => !a.answer.trim()))
                  }
                  variant='danger'
                  fullWidth
                >
                  Désactiver la 2FA
                </PrimaryButton>
                <PrimaryButton
                  variant='outline'
                  onClick={() => setDisableStep('method')}
                  fullWidth
                >
                  Retour
                </PrimaryButton>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <motion.div
        className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'
        whileHover={{ scale: 1.007 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 600, damping: 13 }}
      >
        <div className='flex items-center space-x-4'>
          <div className='rounded-lg bg-primary-100 p-3 dark:bg-primary-700/30'>
            <Key className='h-6 w-6 text-primary-600 dark:text-primary-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Double authentification
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Ajoute une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
        </div>
        <ToggleSwitch
          checked={isEnabled}
          onChange={isEnabled ? handleDisable : handleEnable}
          size='lg'
        />
      </motion.div>

      <Modal
        onClose={closeEnableFlow}
        title='Activer la double authentification'
        size='md'
        urlName='enable-2fa-main'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        onClose={closeDisableFlow}
        title='Désactiver la double authentification'
        size='md'
        urlName='disable-2fa-main'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default TwoFactorMain
