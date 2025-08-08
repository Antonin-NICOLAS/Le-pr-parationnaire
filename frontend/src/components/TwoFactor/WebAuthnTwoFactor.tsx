import React, { useState } from 'react'
import { useAuth } from '../../context/Auth'
import {
  Star,
  Key,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  Fingerprint,
} from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import Modal from '../ui/Modal'
import CustomInput from '../ui/CustomInput'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'

interface WebAuthnCredential {
  id: string
  deviceName: string
  deviceType: string
  lastUsed: Date
  createdAt: Date
}

interface WebAuthnTwoFactorProps {
  isEnabled: boolean
  isPreferredMethod: boolean
  credentials: WebAuthnCredential[]
  onStatusChange: () => void
}

const WebAuthnTwoFactor: React.FC<WebAuthnTwoFactorProps> = ({
  isEnabled,
  isPreferredMethod,
  credentials,
  onStatusChange,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showEnableFlow, setShowEnableFlow] = useState(false)
  const [showDisableFlow, setShowDisableFlow] = useState(false)
  const [showCredentialsList, setShowCredentialsList] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    'register' | 'name' | 'backup' | 'security'
  >('register')
  const [deviceName, setDeviceName] = useState('')
  const [currentCredentialId, setCurrentCredentialId] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [disableMethod, setDisableMethod] = useState<'password' | 'webauthn'>(
    'password',
  )
  const [disablePassword, setDisablePassword] = useState('')

  const {
    registerDevice,
    setCredentialName,
    deleteCredential,
    disableWebAuthn,
  } = useWebAuthnTwoFactor()
  const { setPreferredMethod } = useTwoFactorAuth()
  const { user } = useAuth()

  const handleEnable = async () => {
    setIsLoading(true)
    const result = await registerDevice()

    if (result.success) {
      onStatusChange()
      if (result.credentialId) {
        setShowCredentialsList(false)
        setShowEnableFlow(true)
        setCurrentCredentialId(result.credentialId)
        setCurrentStep('name')
      }
    }
    setIsLoading(false)
  }

  const handleSetName = async () => {
    if (!deviceName.trim()) return

    setIsLoading(true)
    const result = await setCredentialName(currentCredentialId, deviceName)
    if (result?.success) {
      onStatusChange()
      if (credentials.length === 1) {
        setCurrentStep('backup')
      } else {
        setShowEnableFlow(false)
        setShowCredentialsList(true)
      }
    }
    setIsLoading(false)
  }

  const handleDeleteCredential = async (id: string) => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer cette clé de sécurité ?',
      )
    ) {
      setIsLoading(true)
      const success = await deleteCredential(id)
      if (success) {
        onStatusChange()
        if (credentials.length === 0) {
          setShowCredentialsList(false)
        }
      }
      setIsLoading(false)
    }
  }

  const handleDisable = async () => {
    setIsLoading(true)
    const success = await disableWebAuthn(
      user?.email || '',
      disableMethod,
      disablePassword,
    )
    if (success) {
      setShowDisableFlow(false)
      onStatusChange()
    }
    setIsLoading(false)
  }

  const handleSetPreferredMethod = async () => {
    setIsLoading(true)
    const success = await setPreferredMethod('webauthn')
    if (success) {
      onStatusChange()
    }
    setIsLoading(false)
  }

  const handleFlowComplete = () => {
    setShowEnableFlow(false)
    setCurrentStep('register')
    setDeviceName('')
    setCurrentCredentialId('')
    setBackupCodes([])
    onStatusChange()
  }

  const renderEnableFlow = () => {
    switch (currentStep) {
      case 'name':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
                <Key className='h-8 w-8 text-purple-600 dark:text-purple-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Nommez votre clé de sécurité
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Donnez un nom reconnaissable à votre clé de sécurité
              </p>
            </div>

            <CustomInput
              label="Nom de l'appareil"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder='Ex: iPhone de John, Clé YubiKey...'
              autoFocus
            />

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleSetName}
                loading={isLoading}
                disabled={!deviceName.trim()}
                fullWidth
              >
                Continuer
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

  const renderCredentialsList = () => (
    <div className='space-y-4'>
      <div className='flex w-full justify-end'>
        <PrimaryButton
          onClick={handleEnable}
          loading={isLoading}
          size='sm'
          icon={Plus}
        >
          Ajouter une clé
        </PrimaryButton>
      </div>

      <div className='space-y-3'>
        {credentials.map((credential) => (
          <div
            key={credential.id}
            className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'
          >
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
                <Key className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  {credential.deviceName}
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {credential.deviceType} • Dernière utilisation:{' '}
                  {new Date(credential.lastUsed).toLocaleDateString()}
                </div>
              </div>
            </div>
            <PrimaryButton
              variant='outline'
              size='sm'
              onClick={() => handleDeleteCredential(credential.id)}
              icon={Trash2}
              className='text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50'
            >
              Supprimer
            </PrimaryButton>
          </div>
        ))}
      </div>

      {credentials.length === 0 && (
        <div className='text-center py-8'>
          <Key className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <p className='text-gray-500 dark:text-gray-400'>
            Aucune clé de sécurité enregistrée
          </p>
        </div>
      )}
    </div>
  )

  const renderDisableFlow = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
          <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Désactiver WebAuthn
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Choisissez votre méthode de vérification
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex space-x-4'>
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
          <button
            onClick={() => setDisableMethod('webauthn')}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'webauthn'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <Fingerprint className='mx-auto mb-2 h-6 w-6' />
            <div className='text-sm font-medium'>Clé de sécurité</div>
          </button>
        </div>

        {disableMethod === 'password' && (
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
          disabled={disableMethod === 'password' && !disablePassword}
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
          <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
            <Key className='text-purple-600 dark:text-purple-400' size={20} />
          </div>
          <div>
            <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
              Clé de sécurité
            </h4>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              WebAuthn, FaceID, TouchID
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
                  ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
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
          {isEnabled && (
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              {credentials.length} clé{credentials.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className='space-y-2'>
          <PrimaryButton
            variant={isEnabled ? 'secondary' : 'primary'}
            size='sm'
            fullWidth
            onClick={isEnabled ? () => setShowDisableFlow(true) : handleEnable}
            loading={isLoading}
          >
            {isEnabled ? 'Désactiver' : 'Activer'}
          </PrimaryButton>

          {isEnabled && (
            <PrimaryButton
              variant='outline'
              size='sm'
              fullWidth
              onClick={() => setShowCredentialsList(true)}
            >
              Gérer les clés ({credentials.length})
            </PrimaryButton>
          )}
        </div>
      </div>

      <Modal
        isOpen={showEnableFlow}
        onClose={() => setShowEnableFlow(false)}
        title='Activer WebAuthn'
        size='md'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        isOpen={showCredentialsList}
        onClose={() => setShowCredentialsList(false)}
        title='Clés de sécurité'
        size='lg'
      >
        {renderCredentialsList()}
      </Modal>

      <Modal
        isOpen={showDisableFlow}
        onClose={() => setShowDisableFlow(false)}
        title='Désactiver WebAuthn'
        size='md'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default WebAuthnTwoFactor
