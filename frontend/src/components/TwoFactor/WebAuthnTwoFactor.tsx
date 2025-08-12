import {
  AlertCircle,
  Fingerprint,
  Key,
  Plus,
  Shield,
  Star,
  Trash2,
} from 'lucide-react'
import React, { useState } from 'react'

import { useAuth } from '../../context/Auth'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import { useUrlModal } from '../../routes/UseUrlModal'
import type { WebAuthnCredential } from '../../types/user'
import CustomInput from '../ui/CustomInput'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'

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
  const { open: openEnableFlow, close: closeEnableFlow } =
    useUrlModal('enable-webauthn')
  const { open: openDisableFlow, close: closeDisableFlow } =
    useUrlModal('disable-webauthn')
  const { open: openCredentialsList, close: closeCredentialsList } =
    useUrlModal('webauthn-credentials')
  const [currentStep, setCurrentStep] = useState<
    'register' | 'name' | 'backup' | 'security'
  >('register')
  const [deviceName, setDeviceName] = useState('')
  const [disableMethod, setDisableMethod] = useState<'password' | 'webauthn'>(
    'password',
  )
  const [disablePassword, setDisablePassword] = useState('')

  const {
    registerDevice,
    registerDeviceState,
    setCredentialName,
    setCredentialNameState,
    deleteCredential,
    deleteCredentialState,
    disableWebAuthn,
    disableWebAuthnState,
  } = useWebAuthnTwoFactor()
  const { setPreferredMethod, setPreferredMethodState } = useTwoFactorAuth()
  const { user } = useAuth()

  const handleEnable = async () => {
    const result = await registerDevice()

    if (result.success) {
      onStatusChange()
      closeCredentialsList()
      openEnableFlow()
      setCurrentStep('name')
    }
  }

  const handleSetName = async () => {
    if (!deviceName.trim()) return

    const result = await setCredentialName(
      registerDeviceState.data.credentialId,
      deviceName,
    )
    if (result.success) {
      onStatusChange()
      if (credentials.length === 1) {
        setCurrentStep('backup')
      } else {
        closeEnableFlow()
        openCredentialsList()
      }
    }
  }

  const handleDeleteCredential = async (id: string) => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer cette clé de sécurité ?',
      )
    ) {
      const success = await deleteCredential(id)
      if (success) {
        onStatusChange()
        if (credentials.length === 0) {
          closeCredentialsList()
        }
      }
    }
  }

  const handleDisable = async () => {
    const result = await disableWebAuthn(
      user?.email || '',
      disableMethod,
      disablePassword,
    )
    if (result.success) {
      closeDisableFlow()
      onStatusChange()
    }
  }

  const handleSetPreferredMethod = async () => {
    const result = await setPreferredMethod('webauthn')
    if (result.success) {
      onStatusChange()
    }
  }

  const handleFlowComplete = () => {
    closeEnableFlow()
    setCurrentStep('register')
    registerDeviceState.resetData()
    setDeviceName('')
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

      case 'backup':
        return (
          <BackupCodesDisplay
            codes={registerDeviceState.data.backupCodes.map(
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

  const renderCredentialsList = () => (
    <div className='space-y-4'>
      <div className='flex w-full justify-end'>
        <PrimaryButton
          onClick={handleEnable}
          loading={registerDeviceState.loading}
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
              variant='outline'
              size='sm'
              onClick={() => handleDeleteCredential(credential.id)}
              loading={deleteCredentialState.loading}
              icon={Trash2}
              className='border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-300 dark:text-red-500 dark:hover:border-red-400 dark:hover:bg-red-900/20'
            >
              Supprimer
            </PrimaryButton>
          </div>
        ))}
      </div>

      {credentials.length === 0 && (
        <div className='py-8 text-center'>
          <Key className='mx-auto mb-4 h-12 w-12 text-gray-400' />
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
            onChange={(e) => setDisablePassword(e.target.value)}
            autoFocus
          />
        )}
      </div>

      <div className='flex space-x-3'>
        <PrimaryButton
          onClick={handleDisable}
          loading={disableWebAuthnState.loading}
          disabled={disableMethod === 'password' && !disablePassword}
          className='bg-red-600 text-white hover:bg-red-700'
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
          <div className='rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20'>
            <Key className='text-purple-600 dark:text-purple-400' size={20} />
          </div>
          <div className='flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                Clé de sécurité
              </h4>
              {isEnabled && (
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {credentials.length} clé{credentials.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              WebAuthn, FaceID, TouchID
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
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
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

        <div className='space-y-2'>
          <PrimaryButton
            variant={isEnabled ? 'secondary' : 'primary'}
            size='sm'
            fullWidth
            onClick={isEnabled ? openDisableFlow : handleEnable}
            loading={
              isEnabled
                ? disableWebAuthnState.loading
                : registerDeviceState.loading
            }
          >
            {isEnabled ? 'Désactiver' : 'Activer'}
          </PrimaryButton>

          {isEnabled && (
            <PrimaryButton
              variant='outline'
              size='sm'
              fullWidth
              onClick={openCredentialsList}
            >
              Gérer les clés ({credentials.length})
            </PrimaryButton>
          )}
        </div>
      </div>

      <Modal
        onClose={closeEnableFlow}
        title='Activer WebAuthn'
        size='md'
        urlName='enable-webauthn'
      >
        {renderEnableFlow()}
      </Modal>

      <Modal
        onClose={closeCredentialsList}
        title='Clés de sécurité'
        size='lg'
        urlName='webauthn-credentials'
      >
        {renderCredentialsList()}
      </Modal>

      <Modal
        onClose={closeDisableFlow}
        title='Désactiver WebAuthn'
        size='md'
        urlName='disable-webauthn'
      >
        {renderDisableFlow()}
      </Modal>
    </>
  )
}

export default WebAuthnTwoFactor
