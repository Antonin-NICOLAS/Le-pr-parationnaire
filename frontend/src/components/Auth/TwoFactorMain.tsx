import React, { useState } from 'react'
import {
  Key,
  Shield,
  Mail,
  Smartphone,
  Fingerprint,
  AlertTriangle,
  ChevronRight,
  Check,
  Plus,
  RefreshCw,
  ChevronLeft,
  Lock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResendSection from '../ui/ResendSection'
import ToggleSwitch from '../ui/ToggleSwitch'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import ErrorMessage from '../ui/ErrorMessage'
import SixDigitCodeInput from '../ui/SixDigitCodeInput'
import CustomInput from '../ui/CustomInput'
import { useAuth } from '../../context/Auth'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import useAppTwoFactor from '../../hooks/TwoFactor/App'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import useSecurityQuestions from '../../hooks/TwoFactor/SecurityQuestions'
import { useUrlModal } from '../../routes/UseUrlModal'
import BackupCodesDisplay from '../TwoFactor/BackupCodesDisplay'
import SecurityQuestionsSetup from '../TwoFactor/SecurityQuestionsSetup'
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

  // Flow states
  const [enableStep, setEnableStep] = useState<
    'info' | 'method' | 'config' | 'backup' | 'security'
  >('info')
  const [disableStep, setDisableStep] = useState<'method' | 'verify'>('method')
  const [selectedMethod, setSelectedMethod] = useState<
    'email' | 'app' | 'webauthn'
  >('email')
  const [disableMethod, setDisableMethod] = useState<
    'email' | 'app' | 'webauthn' | 'password' | 'backup' | 'security'
  >('email')
  const [showKeyTransferOption, setShowKeyTransferOption] = useState(false)
  const [direction, setDirection] = useState(1)

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
  const [error, setError] = useState<string | null>(null)

  // Hooks
  const {
    configureEmail,
    enableEmail,
    resendCode,
    configureEmailState,
    enableEmailState,
  } = useEmailTwoFactor()
  const { configureApp, enableApp, configureAppState, enableAppState } =
    useAppTwoFactor()
  const {
    registerDevice,
    disableTwoFactor,
    transferCredential,
    registerDeviceState,
  } = useWebAuthnTwoFactor()
  const { getAvailableQuestions } = useSecurityQuestions()

  const resetEnableFlow = () => {
    setEnableStep('info')
    setVerificationCode(Array(6).fill(''))
    setError(null)
  }

  const handleEnable = () => {
    resetEnableFlow()
    openEnableFlow()
  }

  const handleDisable = () => {
    setDisableStep('method')
    setError(null)
    openDisableFlow()
  }

  const changeStep = (newStep: typeof enableStep | typeof disableStep) => {
    setDirection(newStep === 'verify' || newStep === 'config' ? 1 : -1)
    if (newStep === 'method') setDisableStep(newStep)
    else if (newStep === 'verify') setDisableStep(newStep)
    else setEnableStep(newStep as typeof enableStep)
  }

  const handleMethodSelection = async () => {
    setEnableStep('config')
    setVerificationCode(Array(6).fill(''))
    setError(null)

    try {
      switch (selectedMethod) {
        case 'email':
          await configureEmail()
          break
        case 'app':
          await configureApp()
          break
        case 'webauthn':
          if (primaryCredentials.length > 0) {
            setShowKeyTransferOption(true)
          } else {
            await registerDevice('secondary')
          }
          break
      }
    } catch (err) {
      setError('Erreur lors de la configuration de la méthode sélectionnée')
    }
  }

  const handleTransferPrimaryKey = async () => {
    try {
      const result = await transferCredential('primary', 'secondary')
      if (result.success) {
        setShowKeyTransferOption(false)
        setEnableStep('backup')
      }
    } catch (err) {
      setError('Erreur lors du transfert de la clé')
    }
  }

  const handleRegisterNewKey = async () => {
    setShowKeyTransferOption(false)
    try {
      await registerDevice('secondary')
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la nouvelle clé")
    }
  }

  const handleMethodVerification = async () => {
    const code = verificationCode.join('')
    let result

    try {
      switch (selectedMethod) {
        case 'email':
          result = await enableEmail(code)
          break
        case 'app':
          result = await enableApp(code)
          break
        case 'webauthn':
          result = { success: true }
          break
      }

      if (result?.success) {
        setEnableStep('backup')
      } else {
        setError('Code de vérification incorrect')
      }
    } catch (err) {
      setError('Erreur lors de la vérification')
    }
  }

  const handleResendCode = async () => {
    if (selectedMethod === 'email') {
      try {
        await resendCode()
      } catch (err) {
        setError("Erreur lors de l'envoi du code")
      }
    }
  }

  const handleDisableVerification = async () => {
    const result = await disableTwoFactor(
      user?.email || '',
      disableMethod,
      disableMethod === 'backup'
        ? backupCode
        : disableMethod === 'password'
          ? disablePassword
          : verificationCode.join(''),
    )
    if (result?.success) {
      closeDisableFlow()
      onStatusChange()
    }
  }

  const loadSecurityQuestions = async () => {
    try {
      const questions = await getAvailableQuestions()
      setSecurityQuestions(questions.slice(0, 2))
      setSecurityAnswers(
        questions.slice(0, 2).map((q) => ({ questionId: q.id, answer: '' })),
      )
    } catch (err) {
      setError('Erreur lors du chargement des questions de sécurité')
    }
  }

  const MethodCard = ({
    method,
    icon: Icon,
    title,
    description,
    color,
  }: {
    method: 'email' | 'app' | 'webauthn'
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    color: string
  }) => (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedMethod(method)}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
        selectedMethod === method
          ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
      }`}
    >
      <div className='flex items-center space-x-3'>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}
        >
          <Icon
            className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`}
          />
        </div>
        <div>
          <div className='font-medium text-gray-900 dark:text-gray-100'>
            {title}
          </div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {description}
          </div>
        </div>
        <ChevronRight className='ml-auto h-5 w-5 text-gray-400' />
      </div>
    </motion.button>
  )

  const renderEnableFlow = () => {
    switch (enableStep) {
      case 'info':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Shield className='h-8 w-8 text-primary-600 dark:text-primary-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Activer la double authentification
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Renforcez la sécurité de votre compte
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
              <ErrorMessage
                type='info'
                title="Qu'est-ce que la 2FA ?"
                message='La double authentification ajoute une vérification supplémentaire après votre mot de passe pour sécuriser votre compte.'
              />

              <ErrorMessage
                type='warning'
                title='Recommandations'
                message='Configurez au moins deux méthodes et conservez vos codes de secours en lieu sûr.'
              />
            </div>

            <PrimaryButton
              onClick={() => changeStep('method')}
              fullWidth
              icon={ChevronRight}
            >
              Commencer la configuration
            </PrimaryButton>
          </div>
        )

      case 'method':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Choisissez votre méthode principale
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Sélectionnez votre méthode de vérification préférée
              </p>
            </div>

            <div className='space-y-3'>
              {availableMethods.includes('email') && (
                <MethodCard
                  method='email'
                  icon={Mail}
                  title='Email'
                  description='Codes temporaires envoyés par email'
                  color='blue'
                />
              )}

              {availableMethods.includes('app') && (
                <MethodCard
                  method='app'
                  icon={Smartphone}
                  title='Application'
                  description='Google Authenticator, Authy, etc.'
                  color='yellow'
                />
              )}

              {availableMethods.includes('webauthn') && (
                <MethodCard
                  method='webauthn'
                  icon={Fingerprint}
                  title='Clé de sécurité'
                  description='WebAuthn, FaceID, TouchID'
                  color='purple'
                />
              )}
            </div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={() => changeStep('info')}
                variant='outline'
                fullWidth
              >
                Retour
              </PrimaryButton>
              <PrimaryButton
                onClick={handleMethodSelection}
                fullWidth
                loading={
                  (selectedMethod === 'email' && configureEmailState.loading) ||
                  (selectedMethod === 'app' && configureAppState.loading) ||
                  (selectedMethod === 'webauthn' && registerDeviceState.loading)
                }
                disabled={
                  (selectedMethod === 'email' && configureEmailState.loading) ||
                  (selectedMethod === 'app' && configureAppState.loading) ||
                  (selectedMethod === 'webauthn' && registerDeviceState.loading)
                }
              >
                Continuer avec{' '}
                {selectedMethod === 'email'
                  ? 'Email'
                  : selectedMethod === 'app'
                    ? 'Application'
                    : 'Clé'}
              </PrimaryButton>
            </div>
          </div>
        )

      case 'config':
        if (showKeyTransferOption) {
          return (
            <div className='space-y-6'>
              <div className='text-center'>
                <motion.div
                  className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <Fingerprint className='h-8 w-8 text-purple-600 dark:text-purple-400' />
                </motion.div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  Utiliser une clé existante ?
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Vous avez {primaryCredentials.length} clé(s) configurée(s)
                  pour la connexion principale
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
                <PrimaryButton
                  onClick={handleTransferPrimaryKey}
                  fullWidth
                  icon={RefreshCw}
                  loading={registerDeviceState.loading}
                >
                  Transférer une clé existante
                </PrimaryButton>

                <PrimaryButton
                  onClick={handleRegisterNewKey}
                  variant='outline'
                  fullWidth
                  icon={Plus}
                >
                  Enregistrer une nouvelle clé
                </PrimaryButton>
              </div>
            </div>
          )
        }

        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {selectedMethod === 'email' ? (
                  <Mail className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                ) : selectedMethod === 'app' ? (
                  <Smartphone className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
                ) : (
                  <Fingerprint className='h-8 w-8 text-purple-600 dark:text-purple-400' />
                )}
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {selectedMethod === 'email'
                  ? 'Vérification par Email'
                  : selectedMethod === 'app'
                    ? "Configuration de l'application"
                    : 'Enregistrement de clé'}
              </h3>
            </div>

            {error && (
              <ErrorMessage
                message={error}
                type='error'
                onClose={() => setError(null)}
              />
            )}

            {selectedMethod === 'email' && (
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Entrez le code à 6 chiffres envoyé à{' '}
                  <span className='font-medium'>{user?.email}</span>
                </p>

                <SixDigitCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                />
                <ResendSection onResend={handleResendCode} />
              </motion.div>
            )}

            {selectedMethod === 'app' && configureAppState.data?.qrCode && (
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className='text-center'>
                  <img
                    src={configureAppState.data.qrCode}
                    alt='QR Code'
                    className='mx-auto h-48 w-48 rounded-lg border bg-white p-2'
                  />
                  <p className='mt-2 text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded'>
                    {configureAppState.data.secret}
                  </p>
                </div>
                <ol className='list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2 pl-2'>
                  <li>Scannez le QR code avec votre application</li>
                  <li>Ou entrez manuellement le code secret</li>
                  <li>Entrez le code généré ci-dessous</li>
                </ol>
                <SixDigitCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                />
              </motion.div>
            )}

            {selectedMethod === 'webauthn' && registerDeviceState.data && (
              <motion.div
                className='space-y-4 text-center'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                  <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Votre clé de sécurité a été enregistrée avec succès
                </p>
                <PrimaryButton
                  onClick={() => changeStep('backup')}
                  loading={registerDeviceState.loading}
                  disabled={registerDeviceState.loading}
                  fullWidth
                >
                  Continuer
                </PrimaryButton>
              </motion.div>
            )}

            {selectedMethod !== 'webauthn' && (
              <div className='flex space-x-3'>
                <PrimaryButton
                  onClick={() => changeStep('method')}
                  variant='outline'
                  fullWidth
                >
                  Retour
                </PrimaryButton>
                <PrimaryButton
                  onClick={handleMethodVerification}
                  disabled={
                    verificationCode.join('').length !== 6 ||
                    enableEmailState.loading ||
                    enableAppState.loading
                  }
                  loading={enableEmailState.loading || enableAppState.loading}
                  fullWidth
                >
                  Vérifier
                </PrimaryButton>
              </div>
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
              changeStep('security')
            }}
            onSkip={() => {
              closeEnableFlow()
              onStatusChange()
            }}
            isModal
          />
        )

      case 'security':
        return (
          <SecurityQuestionsSetup
            onComplete={() => {
              closeEnableFlow()
              onStatusChange()
            }}
            onSkip={() => {
              closeEnableFlow()
              onStatusChange()
            }}
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
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Désactiver la double authentification
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Choisissez votre méthode de vérification
              </p>
            </div>

            {error && (
              <ErrorMessage
                message={error}
                type='error'
                onClose={() => setError(null)}
              />
            )}

            <ErrorMessage
              type='warning'
              title='Attention'
              message="Cette action réduira la sécurité de votre compte. Assurez-vous d'avoir une autre méthode de protection."
            />

            <div className='grid grid-cols-2 gap-3'>
              <MethodOption
                icon={Key}
                method='password'
                currentMethod={disableMethod}
                onClick={() => setDisableMethod('password')}
                color='orange'
              />
              {availableMethods && availableMethods.includes('email') && (
                <MethodOption
                  icon={Mail}
                  method='email'
                  currentMethod={disableMethod}
                  onClick={() => setDisableMethod('email')}
                  color='blue'
                />
              )}

              {availableMethods && availableMethods.includes('app') && (
                <MethodOption
                  icon={Smartphone}
                  method='app'
                  currentMethod={disableMethod}
                  onClick={() => setDisableMethod('app')}
                  color='yellow'
                />
              )}

              {availableMethods && availableMethods.includes('webauthn') && (
                <MethodOption
                  icon={Fingerprint}
                  method='webauthn'
                  currentMethod={disableMethod}
                  onClick={() => setDisableMethod('webauthn')}
                  color='purple'
                />
              )}

              <MethodOption
                icon={Key}
                method='backup'
                currentMethod={disableMethod}
                onClick={() => setDisableMethod('backup')}
                color='green'
              />

              <MethodOption
                icon={Shield}
                method='security'
                currentMethod={disableMethod}
                onClick={() => {
                  setDisableMethod('security')
                  loadSecurityQuestions()
                }}
                color='orange'
              />
            </div>

            <PrimaryButton onClick={() => changeStep('verify')} fullWidth>
              Vérifier mon identité
            </PrimaryButton>
          </div>
        )

      case 'verify':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Confirmez avec{' '}
                {disableMethod === 'password'
                  ? 'votre mot de passe'
                  : disableMethod === 'email'
                    ? 'votre email'
                    : disableMethod === 'app'
                      ? 'votre application'
                      : disableMethod === 'webauthn'
                        ? 'votre clé'
                        : disableMethod === 'backup'
                          ? 'un code de secours'
                          : 'vos questions de sécurité'}
              </h3>
            </div>

            {error && (
              <ErrorMessage
                message={error}
                type='error'
                onClose={() => setError(null)}
              />
            )}

            {disableMethod === 'password' && (
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CustomInput
                  label='Mot de passe'
                  icon={Lock}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder='Entrez votre mot de passe'
                  autoFocus
                />
                <motion.button
                  onClick={() => changeStep('method')}
                  className='flex items-center text-sm text-primary-600 dark:text-primary-400'
                  whileHover={{ x: 2 }}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Changer de méthode
                </motion.button>
              </motion.div>
            )}

            {(disableMethod === 'email' || disableMethod === 'app') && (
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SixDigitCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                />
                <motion.button
                  onClick={() => changeStep('method')}
                  className='flex items-center text-sm text-primary-600 dark:text-primary-400'
                  whileHover={{ x: 2 }}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Changer de méthode
                </motion.button>
              </motion.div>
            )}

            {disableMethod === 'webauthn' && (
              <motion.div
                className='text-center space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Utilisez votre clé de sécurité pour confirmer la désactivation
                </p>
                <PrimaryButton
                  onClick={handleDisableVerification}
                  fullWidth
                  icon={Fingerprint}
                >
                  Authentifier avec WebAuthn
                </PrimaryButton>
              </motion.div>
            )}

            {disableMethod === 'backup' && (
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CustomInput
                  label='Code de secours'
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder='Entrez un code de secours valide'
                  autoFocus
                />
                <motion.button
                  onClick={() => changeStep('method')}
                  className='flex items-center text-sm text-primary-600 dark:text-primary-400'
                  whileHover={{ x: 2 }}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Changer de méthode
                </motion.button>
              </motion.div>
            )}

            {disableMethod === 'security' && (
              <motion.div
                className='space-y-4'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {securityQuestions.map((question, index) => (
                  <div key={question.id} className='space-y-2'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
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
                      type='password'
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {disableMethod !== 'webauthn' && (
              <PrimaryButton
                onClick={handleDisableVerification}
                disabled={
                  (disableMethod === 'password' && !disablePassword) ||
                  ((disableMethod === 'email' || disableMethod === 'app') &&
                    verificationCode.join('').length !== 6) ||
                  (disableMethod === 'backup' && !backupCode) ||
                  (disableMethod === 'security' &&
                    securityAnswers.some((a) => !a.answer.trim()))
                }
                variant='danger'
                fullWidth
              >
                Confirmer la désactivation
              </PrimaryButton>
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
        className='flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:shadow-none'
        whileHover={{ scale: 1.007 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 600, damping: 13 }}
      >
        <div className='flex items-center space-x-4'>
          <motion.div
            className='rounded-lg bg-gradient-to-br from-primary-100 to-purple-100 p-3 dark:from-primary-900/30 dark:to-purple-900/20'
            whileHover={{ rotate: 5 }}
          >
            <Shield className='h-6 w-6 text-primary-600 dark:text-primary-400' />
          </motion.div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Double authentification
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {isEnabled
                ? 'Active - ' +
                  availableMethods.length +
                  ' méthode(s) configurée(s)'
                : 'Non activée'}
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
        onClose={() => {
          closeEnableFlow()
          resetEnableFlow()
        }}
        title={`${enableStep === 'info' ? 'Activer' : 'Configuration'} 2FA`}
        size='md'
        urlName='enable-2fa-main'
      >
        <AnimatePresence custom={direction} mode='wait'>
          <motion.div
            key={enableStep}
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
        onClose={() => {
          closeDisableFlow()
          setError(null)
        }}
        title='Désactiver la 2FA'
        size='md'
        urlName='disable-2fa-main'
      >
        <AnimatePresence custom={direction} mode='wait'>
          <motion.div
            key={disableStep}
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
            {renderDisableFlow()}
          </motion.div>
        </AnimatePresence>
      </Modal>
    </>
  )
}

const MethodOption = ({
  icon: Icon,
  method,
  currentMethod,
  onClick,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  method: string
  currentMethod: string
  onClick: () => void
  color: string
}) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`rounded-xl border-2 p-4 transition-all flex flex-col items-center ${
      currentMethod === method
        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
    }`}
  >
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-100 dark:bg-${color}-900/20 mb-2`}
    >
      <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div className='text-sm font-medium capitalize'>
      {method === 'webauthn'
        ? 'Clé de sécurité'
        : method === 'backup'
          ? 'Code de secours'
          : method === 'security'
            ? 'Questions'
            : method}
    </div>
  </motion.button>
)

export default TwoFactorMain
