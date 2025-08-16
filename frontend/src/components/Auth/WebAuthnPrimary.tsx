import React, { useState } from 'react'
import {
  Fingerprint,
  Key,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  ChevronLeft,
  RefreshCw,
  Settings2,
} from 'lucide-react'
import TransferCredentialCard from '../TwoFactor/TransferCredentialCard'
import { motion, AnimatePresence } from 'framer-motion'
import ToggleSwitch from '../ui/ToggleSwitch'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import CustomInput from '../ui/CustomInput'
import ErrorMessage from '../ui/ErrorMessage'
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
    useState<string[]>([])
  const [direction, setDirection] = useState(1)

  const {
    registerDevice,
    registerDeviceState,
    setCredentialName,
    setCredentialNameState,
    deleteCredential,
    deleteCredentialState,
    disableWebAuthn,
    disableWebAuthnState,
    transferCredentials,
    transferCredentialsState,
  } = useWebAuthnTwoFactor()

  const handleEnable = async () => {
    if (
      secondaryCredentials.some(
        (credential) =>
          !primaryCredentials?.some(
            (primaryCredential) => credential.id === primaryCredential.id,
          ),
      )
    ) {
      setCurrentStep('transfer-choice')
      openEnableFlow()
    } else {
      await handleRegisterNew()
    }
  }

  const handleTransferSecondaryKeys = async () => {
    if (selectedSecondaryCredential.length === 0) {
      transferCredentialsState.setAnError(
        'Veuillez sélectionner au moins une clé de sécurité',
      )
      return
    }

    const result = await transferCredentials(
      'secondary',
      'primary',
      selectedSecondaryCredential,
    )
    if (result.success) {
      closeEnableFlow()
      setSelectedSecondaryCredential([])
      onStatusChange()
    }
  }

  const handleCredentialSelection = (credentialId: string) => {
    setSelectedSecondaryCredential((prev) =>
      prev.includes(credentialId)
        ? prev.filter((id) => id !== credentialId)
        : [...prev, credentialId],
    )
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
    if (!deviceName.trim()) {
      setCredentialNameState.setAnError(
        'Veuillez entrer un nom pour votre appareil',
      )
      return
    }

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
    if (disableMethod === 'password' && !disablePassword) {
      disableWebAuthnState.setAnError('Veuillez entrer votre mot de passe')
      return
    }

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
    deleteCredentialState.resetError()
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

  const changeStep = (newStep: typeof currentStep) => {
    setDirection(newStep === 'name' ? 1 : -1)
    setCurrentStep(newStep)
  }

  const renderEnableFlow = () => {
    switch (currentStep) {
      case 'transfer-choice':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Fingerprint className='h-8 w-8 text-purple-600 dark:text-purple-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Activer la connexion sans mot de passe
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Vous avez des clés de sécurité existantes. Voulez-vous en
                utiliser une ?
              </p>
            </div>

            <ErrorMessage
              message={transferCredentialsState.error}
              type='error'
              onClose={() => transferCredentialsState.resetError()}
              isVisible={!!transferCredentialsState.error}
            />

            <motion.div
              className='space-y-4'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10'>
                <h4 className='mb-3 font-medium text-blue-900 dark:text-blue-100'>
                  Clés de sécurité disponibles (
                  {selectedSecondaryCredential.length} sélectionnée
                  {selectedSecondaryCredential.length > 1 ? 's' : ''}) :
                </h4>
                <div className='space-y-3'>
                  {primaryCredentials
                    .filter(
                      (credential) =>
                        !secondaryCredentials?.some(
                          (secondaryCredential) =>
                            credential.id === secondaryCredential.id,
                        ),
                    )
                    .map((credential) => (
                      <TransferCredentialCard
                        key={credential.id}
                        credential={credential}
                        isSelected={selectedSecondaryCredential.includes(
                          credential.id,
                        )}
                        onSelect={handleCredentialSelection}
                      />
                    ))}
                </div>
              </div>
            </motion.div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleTransferSecondaryKeys}
                loading={transferCredentialsState.loading}
                disabled={selectedSecondaryCredential.length === 0}
                fullWidth
                icon={RefreshCw}
              >
                Transférer{' '}
                {selectedSecondaryCredential.length > 0
                  ? `(${selectedSecondaryCredential.length})`
                  : ''}
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={() => changeStep('register')}
                fullWidth
                icon={Plus}
              >
                Nouvelle clé
              </PrimaryButton>
            </div>
          </div>
        )

      case 'register':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Key className='h-8 w-8 text-purple-600 dark:text-purple-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Enregistrer une nouvelle clé
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Suivez les instructions de votre navigateur pour enregistrer
                votre clé de sécurité
              </p>
            </div>

            <ErrorMessage
              message={registerDeviceState.error}
              type='error'
              onClose={() => registerDeviceState.resetError()}
              isVisible={!!registerDeviceState.error}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PrimaryButton
                onClick={handleRegisterNew}
                loading={registerDeviceState.loading}
                fullWidth
                icon={Key}
              >
                Enregistrer la clé
              </PrimaryButton>
            </motion.div>

            <motion.button
              onClick={() => changeStep('transfer-choice')}
              className='flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400'
              whileHover={{ x: -2 }}
            >
              <ChevronLeft className='h-4 w-4' />
              Retour aux clés existantes
            </motion.button>
          </div>
        )

      case 'name':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <motion.div
                className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Key className='h-8 w-8 text-purple-600 dark:text-purple-400' />
              </motion.div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Nommez votre clé de sécurité
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Donnez un nom reconnaissable à votre clé de sécurité
              </p>
            </div>

            <ErrorMessage
              message={setCredentialNameState.error}
              type='error'
              onClose={() => setCredentialNameState.resetError()}
              isVisible={!!setCredentialNameState.error}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CustomInput
                label="Nom de l'appareil"
                value={deviceName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDeviceName(e.target.value)
                }
                placeholder='Ex: iPhone de John, Clé YubiKey...'
                autoFocus
              />
            </motion.div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleSetName}
                loading={setCredentialNameState.loading}
                disabled={!deviceName.trim() || setCredentialNameState.loading}
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
        <motion.div
          className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
        </motion.div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Désactiver la connexion sans mot de passe
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Choisissez votre méthode de vérification
        </p>
      </div>

      <ErrorMessage
        message={disableWebAuthnState.error}
        type='error'
        onClose={() => disableWebAuthnState.resetError()}
        isVisible={!!disableWebAuthnState.error}
      />

      <div className='space-y-4'>
        <motion.div
          className='flex space-x-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={() => {
              setDisableMethod('password')
              disableWebAuthnState.resetError()
            }}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'password'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield className='mx-auto mb-2 h-6 w-6 text-gray-900 dark:text-gray-400' />
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400'>
              Mot de passe
            </div>
          </motion.button>
          <motion.button
            onClick={() => {
              setDisableMethod('webauthn')
              disableWebAuthnState.resetError()
            }}
            className={`flex-1 rounded-lg border-2 p-4 transition-all ${
              disableMethod === 'webauthn'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Fingerprint className='mx-auto mb-2 h-6 w-6 text-gray-900 dark:text-gray-400' />
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400'>
              Clé de sécurité
            </div>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {disableMethod === 'password' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CustomInput
                type='password'
                label='Mot de passe'
                value={disablePassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDisablePassword(e.target.value)
                }
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
          <motion.div
            key={credential.id}
            className='flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
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
          </motion.div>
        ))}
      </div>

      {primaryCredentials.length === 0 && (
        <motion.div
          className='py-8 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Key className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <p className='text-gray-500 dark:text-gray-400'>
            Aucune clé de sécurité enregistrée
          </p>
        </motion.div>
      )}
    </div>
  )

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
            className='rounded-lg bg-purple-100 p-3 dark:bg-purple-700/30'
            whileHover={{ rotate: 5 }}
          >
            <Fingerprint className='h-6 w-6 text-purple-600 dark:text-purple-400' />
          </motion.div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Connexion sans mot de passe
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Utilisez WebAuthn pour vous connecter sans mot de passe
            </p>
            {isEnabled && (
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                {primaryCredentials.length} clé
                {primaryCredentials.length > 1 ? 's' : ''} enregistrée
                {primaryCredentials.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-2 flex-shrink-0'>
          {isEnabled && (
            <motion.div whileHover={{ scale: 1.03 }}>
              <PrimaryButton
                variant='outline'
                size='sm'
                icon={Settings2}
                onClick={openCredentialsList}
              >
                Gérer les clés ({primaryCredentials.length})
              </PrimaryButton>
            </motion.div>
          )}
          <ToggleSwitch
            checked={isEnabled}
            onChange={isEnabled ? openDisableFlow : handleEnable}
            size='lg'
          />
        </div>
      </motion.div>

      <Modal
        onClose={() => {
          closeEnableFlow()
          setCurrentStep('transfer-choice')
          registerDeviceState.resetError()
          transferCredentialsState.resetError()
          setCredentialNameState.resetError()
        }}
        title='Activer la connexion sans mot de passe'
        size='md'
        urlName='enable-webauthn-primary'
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
        onClose={closeCredentialsList}
        title='Clés de sécurité primaires'
        size='lg'
        urlName='webauthn-primary-credentials'
      >
        {renderCredentialsList()}
      </Modal>

      <Modal
        onClose={() => {
          closeDisableFlow()
          disableWebAuthnState.resetError()
        }}
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
