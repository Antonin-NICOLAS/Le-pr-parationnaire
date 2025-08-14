'use client'

import {
  AlertCircle,
  Fingerprint,
  Key,
  Plus,
  Shield,
  Trash2,
  ChevronLeft,
} from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '../../context/Auth'
import useTwoFactorAuth from '../../hooks/TwoFactor/Main'
import useWebAuthnTwoFactor from '../../hooks/TwoFactor/WebAuthn'
import { useUrlModal } from '../../routes/UseUrlModal'
import type { WebAuthnCredential } from '../../types/user'
import CustomInput from '../ui/CustomInput'
import Modal from '../ui/Modal'
import PrimaryButton from '../ui/PrimaryButton'
import ErrorMessage from '../ui/ErrorMessage'
import BackupCodesDisplay from './BackupCodesDisplay'
import SecurityQuestionsSetup from './SecurityQuestionsSetup'
import TwoFactorMethodCard from './TwoFactorMethodCard'
import MethodSelectionCard from './MethodSelectionCard'
import TransferCredentialCard from './TransferCredentialCard'

interface WebAuthnTwoFactorProps {
  isEnabled: boolean
  isPreferredMethod: boolean
  credentials: WebAuthnCredential[]
  primaryCredentials?: WebAuthnCredential[]
  onStatusChange: () => void
}

const WebAuthnTwoFactor: React.FC<WebAuthnTwoFactorProps> = ({
  isEnabled,
  isPreferredMethod,
  credentials,
  primaryCredentials = [],
  onStatusChange,
}) => {
  const {
    isOpen: isEnableFlowOpen,
    open: openEnableFlow,
    close: closeEnableFlow,
  } = useUrlModal('enable-webauthn')
  const { open: openDisableFlow, close: closeDisableFlow } =
    useUrlModal('disable-webauthn')
  const { open: openCredentialsList, close: closeCredentialsList } =
    useUrlModal('webauthn-credentials')
  const [currentStep, setCurrentStep] = useState<
    'transfer-choice' | 'register' | 'name' | 'backup' | 'security'
  >('register')
  const [deviceName, setDeviceName] = useState('')
  const [disableMethod, setDisableMethod] = useState<'password' | 'webauthn'>(
    'password',
  )
  const [disablePassword, setDisablePassword] = useState('')
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const [direction, setDirection] = useState(1)
  const [error, setError] = useState<string | null>(null)

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
  const { setPreferredMethod, setPreferredMethodState } = useTwoFactorAuth()
  const { user } = useAuth()

  const handleEnable = async () => {
    if (
      primaryCredentials.some(
        (credential) =>
          !credentials?.some(
            (secondaryCredential) => credential.id === secondaryCredential.id,
          ),
      )
    ) {
      setCurrentStep('transfer-choice')
      openEnableFlow()
    } else {
      await handleRegisterNew()
    }
  }

  const handleUseExistingCredentials = async () => {
    if (selectedCredentials.length === 0) {
      setError('Veuillez sélectionner au moins une clé de sécurité')
      return
    }

    try {
      const result = await transferCredentials(
        'primary',
        'secondary',
        selectedCredentials,
      )

      if (result.message) {
        closeEnableFlow()
        setSelectedCredentials([])
        onStatusChange()
        setError(null)
      } else {
        setError('Erreur lors du transfert de certaines clés')
      }
    } catch (err) {
      setError('Erreur lors du transfert des clés')
    }
  }

  const handleRegisterNew = async () => {
    const result = await registerDevice('secondary')

    if (result.success) {
      onStatusChange()
      if (result.RequiresSetName) {
        setCurrentStep('name')
        if (!isEnableFlowOpen) openEnableFlow()
      } else {
        setCurrentStep('backup')
        if (!isEnableFlowOpen) openEnableFlow()
      }
    } else {
      setError("Erreur lors de l'enregistrement de la clé")
    }
  }

  const handleCredentialSelection = (credentialId: string) => {
    setSelectedCredentials((prev) =>
      prev.includes(credentialId)
        ? prev.filter((id) => id !== credentialId)
        : [...prev, credentialId],
    )
  }

  const changeStep = (newStep: typeof currentStep) => {
    setDirection(
      newStep === 'name' || newStep === 'backup' || newStep === 'security'
        ? 1
        : -1,
    )
    setCurrentStep(newStep)
  }

  const handleSetName = async () => {
    if (!deviceName.trim()) return

    const result = await setCredentialName(
      'secondary',
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
      const success = await deleteCredential('secondary', id)
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
      'secondary',
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
                Activer WebAuthn
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Vous avez des clés de sécurité existantes. Voulez-vous en
                utiliser ?
              </p>
            </div>

            {error && (
              <ErrorMessage
                message={error}
                type='error'
                onClose={() => setError(null)}
              />
            )}

            <motion.div
              className='space-y-4'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10'>
                <h4 className='mb-3 font-medium text-blue-900 dark:text-blue-100'>
                  Clés de sécurité disponibles ({selectedCredentials.length}{' '}
                  sélectionnée
                  {selectedCredentials.length > 1 ? 's' : ''}) :
                </h4>
                <div className='space-y-3'>
                  {primaryCredentials
                    .filter(
                      (credential) =>
                        !credentials?.some(
                          (secondaryCredential) =>
                            credential.id === secondaryCredential.id,
                        ),
                    )
                    .map((credential) => (
                      <TransferCredentialCard
                        key={credential.id}
                        credential={credential}
                        isSelected={selectedCredentials.includes(credential.id)}
                        onSelect={handleCredentialSelection}
                      />
                    ))}
                </div>
              </div>
            </motion.div>

            <div className='flex space-x-3'>
              <PrimaryButton
                onClick={handleUseExistingCredentials}
                loading={transferCredentialsState.loading}
                disabled={selectedCredentials.length === 0}
                fullWidth
              >
                Utiliser ces clés ({selectedCredentials.length})
              </PrimaryButton>
              <PrimaryButton
                variant='outline'
                onClick={() => changeStep('register')}
                fullWidth
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

            {error && (
              <ErrorMessage
                message={error}
                type='error'
                onClose={() => setError(null)}
              />
            )}

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

            {primaryCredentials.length > 0 && (
              <motion.button
                onClick={() => changeStep('transfer-choice')}
                className='flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400'
                whileHover={{ x: -2 }}
              >
                <ChevronLeft className='h-4 w-4' />
                Retour aux clés existantes
              </motion.button>
            )}
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
        <div className='grid grid-cols-2 gap-3'>
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
          <MethodSelectionCard
            icon={Fingerprint}
            title='Clé de sécurité'
            description='WebAuthn'
            color='purple'
            isSelected={disableMethod === 'webauthn'}
            onClick={() => setDisableMethod('webauthn')}
            layout='vertical'
            showChevron={false}
          />
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

  return (
    <>
      <TwoFactorMethodCard
        icon={Key}
        iconColor='purple'
        title='Clé de sécurité'
        description='WebAuthn, FaceID, TouchID'
        isEnabled={isEnabled}
        isPreferred={isPreferredMethod}
        onToggle={isEnabled ? openDisableFlow : handleEnable}
        onSetPreferred={handleSetPreferredMethod}
        toggleLoading={
          isEnabled ? disableWebAuthnState.loading : registerDeviceState.loading
        }
        preferredLoading={setPreferredMethodState.loading}
        additionalInfo={
          isEnabled
            ? `${credentials?.length || 0} clé${(credentials?.length || 0) > 1 ? 's' : ''}`
            : undefined
        }
      >
        {isEnabled && (
          <PrimaryButton
            variant='outline'
            size='sm'
            fullWidth
            onClick={openCredentialsList}
          >
            Gérer les clés ({credentials?.length || 0})
          </PrimaryButton>
        )}
      </TwoFactorMethodCard>

      <Modal
        onClose={() => {
          closeEnableFlow()
          setCurrentStep('register')
          setError(null)
          setSelectedCredentials([])
        }}
        title='Activer WebAuthn'
        size='md'
        urlName='enable-webauthn'
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
