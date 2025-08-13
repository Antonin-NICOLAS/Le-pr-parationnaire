import React, { useState } from 'react'
import { Fingerprint, Key, Shield, Mail, AlertTriangle } from 'lucide-react'
import ToggleSwitch from './ToggleSwitch'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import CustomInput from './CustomInput'
import SixDigitCodeInput from './SixDigitCodeInput'
import ErrorMessage from './ErrorMessage'
import { useAuth } from '../../context/Auth'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import useEmailTwoFactor from '../../hooks/TwoFactor/Email'
import { useNavigate } from 'react-router-dom'

interface SecuritySwitchProps {
  type: '2fa' | 'webauthn-login'
  isEnabled: boolean
  onStatusChange: () => void
}

const SecuritySwitch: React.FC<SecuritySwitchProps> = ({
  type,
  isEnabled,
  onStatusChange,
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [disableMethod, setDisableMethod] = useState<
    'password' | 'email' | 'app' | 'webauthn'
  >('password')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)

  const { authenticate } = useWebAuthnTwoFactor()
  const { resendCode } = useEmailTwoFactor()

  const handleToggle = (checked: boolean) => {
    if (checked) {
      if (type === '2fa') {
        // Check if any 2FA method is configured
        setShowEnableModal(true)
      } else if (type === 'webauthn-login') {
        // Check if WebAuthn is configured
        navigate('/settings/2fa?modal=enable-webauthn')
      }
    } else {
      setShowDisableModal(true)
    }
  }

  const handleDisable = async () => {
    setError(null)

    try {
      let verificationValue = ''

      switch (disableMethod) {
        case 'password':
          verificationValue = disablePassword
          break
        case 'email':
        case 'app':
          verificationValue = disableCode.join('')
          break
        case 'webauthn':
          const result = await authenticate(user?.email || '', false)
          if (!result?.success) {
            setError('WebAuthn verification failed')
            return
          }
          verificationValue = 'webauthn_verified'
          break
      }

      if (!verificationValue) {
        setError('Please provide verification')
        return
      }

      // Call API to disable the feature
      // This would be implemented based on your backend API
      console.log(`Disabling ${type} with method ${disableMethod}`)

      setShowDisableModal(false)
      onStatusChange()
    } catch (error) {
      setError('Verification failed')
    }
  }

  const handleSendEmailCode = async () => {
    if (user?.email) {
      await resendCode(user.email, 'disable')
    }
  }

  const getConfig = () => {
    if (type === '2fa') {
      return {
        title: 'Double authentification',
        description:
          'Ajoute une couche de sécurité supplémentaire à votre compte',
        icon: Key,
        enableModalTitle: 'Activer la double authentification',
        disableModalTitle: 'Désactiver la double authentification',
      }
    } else {
      return {
        title: 'Connexion sans mot de passe',
        description: 'Utilisez WebAuthn pour vous connecter sans mot de passe',
        icon: Fingerprint,
        enableModalTitle: 'Activer la connexion WebAuthn',
        disableModalTitle: 'Désactiver la connexion WebAuthn',
      }
    }
  }

  const config = getConfig()
  const IconComponent = config.icon

  return (
    <>
      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex items-center space-x-4'>
          <div className='rounded-lg bg-primary-100 p-3 dark:bg-primary-900/20'>
            <IconComponent className='h-6 w-6 text-primary-600 dark:text-primary-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {config.title}
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {config.description}
            </p>
          </div>
        </div>
        <ToggleSwitch checked={isEnabled} onChange={handleToggle} size='lg' />
      </div>

      {/* Enable Modal */}
      <Modal
        isOpen={showEnableModal}
        onClose={() => setShowEnableModal(false)}
        title={config.enableModalTitle}
        size='md'
      >
        <div className='space-y-6'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
              <IconComponent className='h-8 w-8 text-primary-600 dark:text-primary-400' />
            </div>
            <p className='text-gray-600 dark:text-gray-400'>
              {type === '2fa'
                ? "Vous devez d'abord configurer au moins une méthode de double authentification."
                : "Vous devez d'abord configurer WebAuthn dans les paramètres 2FA."}
            </p>
          </div>
          <div className='flex space-x-3'>
            <PrimaryButton
              onClick={() => {
                setShowEnableModal(false)
                navigate('/settings/2fa')
              }}
              fullWidth
            >
              Configurer maintenant
            </PrimaryButton>
            <PrimaryButton
              variant='outline'
              onClick={() => setShowEnableModal(false)}
              fullWidth
            >
              Annuler
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* Disable Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title={config.disableModalTitle}
        size='md'
      >
        <div className='space-y-6'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
              <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <p className='text-gray-600 dark:text-gray-400'>
              Choisissez votre méthode de vérification pour désactiver cette
              fonctionnalité
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
            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={() => setDisableMethod('password')}
                className={`rounded-lg border-2 p-4 transition-all ${
                  disableMethod === 'password'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                }`}
              >
                <Shield className='mx-auto mb-2 h-6 w-6' />
                <div className='text-sm font-medium'>Mot de passe</div>
              </button>
              <button
                onClick={() => setDisableMethod('email')}
                className={`rounded-lg border-2 p-4 transition-all ${
                  disableMethod === 'email'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                }`}
              >
                <Mail className='mx-auto mb-2 h-6 w-6' />
                <div className='text-sm font-medium'>Code email</div>
              </button>
            </div>

            {disableMethod === 'password' && (
              <CustomInput
                type='password'
                label='Mot de passe'
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder='Entrez votre mot de passe'
                autoFocus
              />
            )}

            {disableMethod === 'email' && (
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    Code envoyé à votre email
                  </span>
                  <PrimaryButton
                    variant='ghost'
                    size='sm'
                    onClick={handleSendEmailCode}
                  >
                    Renvoyer
                  </PrimaryButton>
                </div>
                <SixDigitCodeInput
                  value={disableCode}
                  onChange={setDisableCode}
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className='flex space-x-3'>
            <PrimaryButton
              onClick={handleDisable}
              variant='danger'
              disabled={
                (disableMethod === 'password' && !disablePassword) ||
                (disableMethod === 'email' && disableCode.join('').length !== 6)
              }
              fullWidth
            >
              Désactiver
            </PrimaryButton>
            <PrimaryButton
              variant='outline'
              onClick={() => setShowDisableModal(false)}
              fullWidth
            >
              Annuler
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default SecuritySwitch
