import React, { useState } from 'react'
import {
  Fingerprint,
  Key,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import ToggleSwitch from '../ui/ToggleSwitch'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import CustomInput from '../ui/CustomInput'
import { useAuth } from '../../context/Auth'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import { useUrlModal } from '../../routes/UseUrlModal'
import type { WebAuthnCredential } from '../../types/user'

interface WebAuthnPrimaryProps {
  isEnabled: boolean
  primaryCredentials: WebAuthnCredential[]
  secondaryCredentials: WebAuthnCredential[]
  onStatusChange: () => void
}

const WebAuthnPrimary: React.FC<WebAuthnPrimaryProps> = ({
  isEnabled,
  primaryCredentials,
  secondaryCredentials,
  onStatusChange,
}) => {
  const { user } = useAuth()
  const {
    isOpen: isEnableFlowOpen,
    open: openEnableFlow,
    close: closeEnableFlow,
  } = useUrlModal('enable-webauthn-primary')
  const { open: openDisableFlow, close: closeDisableFlow } = useUrlModal(
    'disable-webauthn-primary',
  )
  const { open: openCredentialsList, close: closeCredentialsList } =
    useUrlModal('webauthn-primary-credentials')

  const [currentStep, setCurrentStep] = useState<
    'transfer-choice' | 'register' | 'name'
  >('transfer-choice')
  const [deviceName, setDeviceName] = useState('')
  const [disableMethod, setDisableMethod] = useState<'password' | 'webauthn'>(
    'password',
  )
  const [disablePassword, setDisablePassword] = useState('')
  const [selectedSecondaryCredential, setSelectedSecondaryCredential] =
    useState<string>('')

  const {
    registerDevice,
    registerDeviceState,
    setCredentialName,
    setCredentialNameState,
    deleteCredential,
    deleteCredentialState,
    disableWebAuthn,
    disableWebAuthnState,
    transferCredential,
    transferCredentialState,
  } = useWebAuthnTwoFactor()

  const handleEnable = async () => {
    if (secondaryCredentials.length > 0) {
      setCurrentStep('transfer-choice')
      openEnableFlow()
    } else {
      await handleRegisterNew()
    }
  }

  const handleUseExistingCredential = async () => {
    if (!selectedSecondaryCredential) return

    const result = await transferCredential(
      'secondary',
      'primary',
      selectedSecondaryCredential,
    )
    if (result.success) {
      closeEnableFlow()
      onStatusChange()
    }
  }

  const handleRegisterNew = async () => {
    const result = await registerDevice('primary')

    if (result.success) {
      if (result.RequiresSetName) {
        setCurrentStep('name')
        if (!isEnableFlowOpen) openEnableFlow()
      } else {
        closeEnableFlow()
        onStatusChange()
      }
    }
  }

  const handleSetName = async () => {
    if (!deviceName.trim()) return

    const result = await setCredentialName(
      'primary',
      registerDeviceState.data.credentialId,
      deviceName,
    )
    if (result.success) {
      closeEnableFlow()
      setDeviceName('')
      setCurrentStep('transfer-choice')
      onStatusChange()
    }
  }

  const handleDisable = async () => {
    const result = await disableWebAuthn(
      'primary',
      user?.email || '',
      disableMethod,
      disablePassword,
    )
    if (result.success) {
      closeDisableFlow()
      setDisablePassword('')
      onStatusChange()
    }
  }

  const handleDeleteCredential = async (id: string) => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer cette clé de sécurité ?',
      )
    ) {
      const result = await deleteCredential('primary', id)
      if (result.success) {
        onStatusChange()
        if (primaryCredentials.length <= 1) {
          closeCredentialsList()
        }
      }
    }
  }

  const renderEnableFlow = () => {
    switch (currentStep) {
      case 'transfer-choice':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
                <Fingerprint className='h-8 w-8 text-purple-600 dark:text-purple-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Activer la connexion sans mot de passe
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Vous avez des clés de sécurité existantes. Voulez-vous en
                utiliser une ?
              </p>
            </div>

            <div className='space-y-4'>
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10'>
                <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                  Clés de sécurité disponibles :
                </h4>
                <div className='space-y-2'>
                  {secondaryCredentials.map((credential) => (
                    <label
                      key={credential.id}
                      className='flex items-center space-x-3'
                    >
                      <input
                        type='radio'
                        name='secondaryCredential'
                        value={credential.id}
                        checked={selectedSecondaryCredential === credential.id}
                        onChange={(e) =>
                          setSelectedSecondaryCredential(e.target.value)
                        }
                        className='text-primary-600 focus:ring-primary-500'
                      />
                      <span className='text-sm text-blue-800 dark:text-blue-200'>
                        {credential.deviceName} ({credential.deviceType})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleUseExistingCredential}
                loading={transferCredentialState.loading}
                disabled={!selectedSecondaryCredential}
                fullWidth
              >
                Utiliser cette clé
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={() => setCurrentStep('register')}
                fullWidth
              >
                Enregistrer une nouvelle clé
              </PrimaryButton>
            </div>
          </div>
        )

      case 'register':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
                <Key className='h-8 w-8 text-purple-600 dark:text-purple-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Enregistrer une nouvelle clé
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Suivez les instructions de votre navigateur pour enregistrer
                votre clé de sécurité
              </p>
            </div>

            <PrimaryButton
              onClick={handleRegisterNew}
              loading={registerDeviceState.loading}
              fullWidth
              icon={Key}
            >
              Enregistrer la clé
            </PrimaryButton>
          </div>
        )

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDeviceName(e.target.value)
              }
              placeholder='Ex: iPhone de John, Clé YubiKey...'
              autoFocus
            />

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleSetName}
                loading={setCredentialNameState.loading}
                disabled={!deviceName.trim()}
                fullWidth
              >
                Continuer
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

      default:
        return null
    }
  }

  const renderDisableFlow = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
          <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Désactiver la connexion sans mot de passe
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
            <Shield className='mx-auto mb-2 h-6 w-6 text-gray-900 dark:text-gray-400' />
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400'>
              Mot de passe
            </div>
          </button>
          <button
            onClick={() => setDisableMethod('webauthn')}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'webauthn'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
          >
            <Fingerprint className='mx-auto mb-2 h-6 w-6 text-gray-900 dark:text-gray-400' />
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400'>
              Clé de sécurité
            </div>
          </button>
        </div>

        {disableMethod === 'password' && (
          <CustomInput
            type='password'
            label='Mot de passe'
            value={disablePassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDisablePassword(e.target.value)
            }
            autoFocus
          />
        )}
      </div>

      <div className='flex space-x-3'>
        <PrimaryButton
          onClick={handleDisable}
          variant='danger'
          loading={disableWebAuthnState.loading}
          disabled={disableMethod === 'password' && !disablePassword}
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

  const renderCredentialsList = () => (
    <div className='space-y-4'>
      <div className='flex w-full justify-end'>
        <PrimaryButton
          onClick={handleRegisterNew}
          loading={registerDeviceState.loading}
          size='sm'
          icon={Plus}
        >
          Ajouter une clé
        </PrimaryButton>
      </div>

      <div className='space-y-3'>
        {primaryCredentials.map((credential) => (
          <div
            key={credential.id}
            className='flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'
          >
            <div className='flex items-center space-x-3'>
              <div className='rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20'>
                <Key className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  {credential.deviceName}
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {credential.deviceType} • Dernière utilisation:{' '}
                  {new Date(credential.lastUsed || '').toLocaleDateString() ||
                    'Jamais'}
                </div>
              </div>
            </div>
            <PrimaryButton
              variant='danger'
              size='sm'
              onClick={() => handleDeleteCredential(credential.id)}
              loading={deleteCredentialState.loading}
              icon={Trash2}
            >
              Supprimer
            </PrimaryButton>
          </div>
        ))}
      </div>

      {primaryCredentials.length === 0 && (
        <div className='py-8 text-center'>
          <Key className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <p className='text-gray-500 dark:text-gray-400'>
            Aucune clé de sécurité enregistrée
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <motion.div
        className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'
        whileHover={{ scale: 1.007 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 600, damping: 13 }}
      >
        <div className='flex items-center space-x-4'>
          <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-700/30'>
            <Fingerprint className='h-6 w-6 text-purple-600 dark:text-purple-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Connexion sans mot de passe
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Utilisez WebAuthn pour vous connecter sans mot de passe
            </p>
            {isEnabled && (
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                {primaryCredentials.length} clé
                {primaryCredentials.length > 1 ? 's' : ''} enregistrée
                {primaryCredentials.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className='flex flex-col items-end space-y-2'>
          <ToggleSwitch
            checked={isEnabled}
            onChange={isEnabled ? openDisableFlow : handleEnable}
            size='lg'
          />
          {isEnabled && (
            <PrimaryButton
              variant='outline'
              size='sm'
              onClick={openCredentialsList}
            >
              Gérer les clés ({primaryCredentials.length})
            </PrimaryButton>
          )}
        </div>
      </motion.div>

      <Modal
        onClose={closeEnableFlow}
        title='Activer la connexion sans mot de passe'
        size='md'
        urlName='enable-webauthn-primary'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        onClose={closeCredentialsList}
        title='Clés de sécurité primaires'
        size='lg'
        urlName='webauthn-primary-credentials'
      >
        {renderCredentialsList()}
      </Modal>

      <Modal
        onClose={closeDisableFlow}
        title='Désactiver la connexion sans mot de passe'
        size='md'
        urlName='disable-webauthn-primary'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default WebAuthnPrimary
