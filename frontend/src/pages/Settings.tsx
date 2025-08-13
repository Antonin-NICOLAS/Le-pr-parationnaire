import {
  AlertTriangle,
  Bell,
  Calendar,
  Download,
  Globe,
  Key,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Shield,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import AppTwoFactor from '../components/TwoFactor/AppTwoFactor'
import BackupCodesDisplay from '../components/TwoFactor/BackupCodesDisplay'
import EmailTwoFactor from '../components/TwoFactor/EmailTwoFactor'
import WebAuthnTwoFactor from '../components/TwoFactor/WebAuthnTwoFactor'
import CustomInput from '../components/ui/CustomInput'
import Modal from '../components/ui/Modal'
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter'
import PrimaryButton from '../components/ui/PrimaryButton'
import SettingsCard from '../components/ui/SettingsCard'
import SixDigitCodeInput from '../components/ui/SixDigitCodeInput'
import TabNavigation from '../components/ui/TabNavigation'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import { useAuth } from '../context/Auth'
import useTwoFactorAuth from '../hooks/TwoFactor/Main'
import SecuritySwitch from '../components/ui/SecuritySwitch'
import useUserSettings from '../hooks/useUserSettings'
import { useUrlModal } from '../routes/UseUrlModal'
import type { ChangePassword, PasswordStrength } from '../types/auth'
import type { LoginHistory } from '../types/user'
import useSessions from '../hooks/Auth/useSessions'
import ResendAction from '../components/ui/ResendAction'
import { useFormHandler } from '../hooks/useFormHandler'
import { changeEmailSchema } from '../utils/validation'

const SettingsPage: React.FC = () => {
  const { tab = 'security' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    checkActiveSessions,
    checkActiveSessionsState,
    revokeSession,
    revokeSessionState,
    revokeAllSessions,
    revokeAllSessionsState,
  } = useSessions()
  const {
    changePassword,
    changePasswordState,
    changeEmailStep1,
    changeEmailStep1State,
    changeEmailStep2,
    changeEmailStep2State,
    changeEmailStep3,
    changeEmailStep3State,
    changeEmailStep4,
    changeEmailStep4State,
    deleteAccount,
    deleteAccountState,
  } = useUserSettings()

  const tabs = [
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: '2fa', label: 'Double authentification', icon: Key },
    { id: 'account', label: 'Compte', icon: Trash2 },
  ]

  // 2FA state
  const { getTwoFactorStatus, getTwoFactorStatusState } = useTwoFactorAuth()

  // Password change state
  const [passwordForm, setPasswordForm] = useState<ChangePassword>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null)

  // Email change state
  const [emailChangeStep, setEmailChangeStep] = useState<
    'verify-current' | 'new-email' | 'verify-new' | null
  >(null)
  // Notification preferences
  const [notifications, setNotifications] = useState({
    accountActivity: true,
    blogNews: false,
    securityAlerts: true,
    emailDigest: true,
  })

  // Delete account state
  const { open, close } = useUrlModal('delete-account')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const changeEmailForm = useFormHandler({
    initialValues: {
      currentEmailCode: Array(6).fill(''),
      newEmail: '',
      newEmailCode: Array(6).fill(''),
    },
    validationSchema: changeEmailSchema,
    validateOnChange: true,
    validateOnBlur: false,
  })

  const fetch2FAStatus = async () => {
    await getTwoFactorStatus()
  }

  useEffect(() => {
    const fetchActiveSessions = async () => {
      await checkActiveSessions()
    }
    fetchActiveSessions()
    fetch2FAStatus()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordStrength && passwordStrength.score < 70) {
      toast.error('Veuillez choisir un mot de passe plus fort')
      return
    }

    await changePassword(passwordForm)
  }

  const handleEmailChangeStart = async () => {
    const result = await changeEmailStep1()
    if (result.success) {
      setEmailChangeStep('verify-current')
    }
  }

  const handleCurrentEmailVerification = async () => {
    const result = await changeEmailStep2(
      changeEmailForm.values.currentEmailCode.join(''),
    )
    if (result.success) {
      setEmailChangeStep('new-email')
    }
  }

  const handleNewEmailSubmit = async () => {
    const result = await changeEmailStep3(changeEmailForm.values.newEmail)
    if (result.success) {
      setEmailChangeStep('verify-new')
    }
  }

  const handleNewEmailVerification = async () => {
    const result = await changeEmailStep4(
      changeEmailForm.values.newEmailCode.join(''),
    )
    if (result.success) {
      changeEmailForm.reset()
      setEmailChangeStep(null)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    await revokeSession(sessionId)
  }

  const handleRevokeAllSessions = async () => {
    const result = await revokeAllSessions()
    if (result.success) {
      navigate('auth/login', { replace: true })
    }
  }

  const handleDeleteAccount = async () => {
    if (
      deleteConfirmation.toLocaleUpperCase() !== 'SUPPRIMER' &&
      deleteConfirmation !== user?.email
    ) {
      toast.error('Confirmation incorrecte')
      return
    }
    const result = await deleteAccount()
    if (result.success) {
      close()
      navigate('auth/register', { replace: true })
    }
  }

  const renderSecurityTab = () => (
    <div className='space-y-6'>
      {/* Security Switches */}
      <SettingsCard
        title='Paramètres de sécurité'
        description='Configurez vos options de sécurité avancées'
        icon={Shield}
      >
        <div className='space-y-4'>
          <SecuritySwitch
            type='2fa'
            isEnabled={getTwoFactorStatusState.data?.isEnabled || false}
            onStatusChange={() => fetch2FAStatus()}
          />
          <SecuritySwitch
            type='webauthn-login'
            isEnabled={
              getTwoFactorStatusState.data?.webauthn?.isEnabled || false
            }
            onStatusChange={() => fetch2FAStatus()}
          />
        </div>
      </SettingsCard>

      {/* Sessions actives */}
      <SettingsCard
        title='Sessions actives'
        description='Gérez vos sessions de connexion'
        icon={Monitor}
      >
        <div className='space-y-4'>
          {!checkActiveSessionsState.loading &&
          checkActiveSessionsState.data?.sessions?.length ? (
            checkActiveSessionsState.data.sessions.map(
              (session: LoginHistory) => (
                <div
                  key={session.sessionId}
                  className='flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'
                >
                  <div className='flex flex-1 items-center space-x-3'>
                    <div className='flex-shrink-0'>
                      <Monitor size={20} className='text-gray-500' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-gray-900 dark:text-gray-100'>
                          {session.deviceType}
                        </span>
                        {session.isCurrent && (
                          <span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-400'>
                            Session actuelle
                          </span>
                        )}
                      </div>
                      <div className='grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                        <span className='flex justify-center space-x-1 max-[604px]:col-span-2 col-span-1'>
                          <Globe size={14} className='mt-[3px]' />
                          <span>{session.ip}</span>
                        </span>
                        <span className='flex justify-center space-x-1 col-span-2'>
                          <MapPin size={14} className='mt-[3px]' />
                          <span>
                            {session.location || 'Localisation inconnue'}
                          </span>
                        </span>
                        <span className='flex justify-center space-x-1 max-[604px]:col-span-2 col-span-1'>
                          <Calendar size={14} className='mt-[3px]' />
                          <span>
                            {new Date(
                              session.lastActive || 0,
                            ).toLocaleDateString() || 'Inconnu'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <PrimaryButton
                      variant='outline'
                      size='sm'
                      onClick={() => handleRevokeSession(session.sessionId)}
                      loading={
                        revokeSessionState.loading ||
                        revokeAllSessionsState.loading
                      }
                    >
                      Révoquer
                    </PrimaryButton>
                  )}
                </div>
              ),
            )
          ) : (
            <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
              <p className='text-gray-500 dark:text-gray-400'>
                {checkActiveSessionsState.loading
                  ? 'Chargement des sessions...'
                  : 'Aucune session active trouvée'}
              </p>
            </div>
          )}
          {!checkActiveSessionsState.loading &&
            checkActiveSessionsState.data?.sessions?.length &&
            checkActiveSessionsState.data.sessions.length !== 1 && (
              <PrimaryButton
                variant='secondary'
                onClick={handleRevokeAllSessions}
                loading={
                  revokeSessionState.loading || revokeAllSessionsState.loading
                }
                icon={LogOut}
              >
                Déconnecter toutes les sessions
              </PrimaryButton>
            )}
        </div>
      </SettingsCard>

      {/* Changer le mot de passe */}
      <SettingsCard
        title='Changer le mot de passe'
        description='Modifiez votre mot de passe actuel'
        icon={Key}
      >
        <form onSubmit={handlePasswordChange} className='space-y-4'>
          <CustomInput
            type='password'
            label='Mot de passe actuel'
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            required
          />
          <CustomInput
            type='password'
            label='Nouveau mot de passe'
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            required
          />
          {passwordForm.newPassword && (
            <PasswordStrengthMeter
              password={passwordForm.newPassword}
              onStrengthChange={setPasswordStrength}
            />
          )}
          <CustomInput
            type='password'
            label='Confirmer le nouveau mot de passe'
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            required
          />
          <PrimaryButton
            type='submit'
            loading={changePasswordState.loading}
            disabled={
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
          >
            Modifier le mot de passe
          </PrimaryButton>
        </form>
      </SettingsCard>

      {/* Changer l'email */}
      <SettingsCard
        title="Changer d'adresse email"
        description='Modifiez votre adresse email de connexion'
        icon={Mail}
      >
        {!emailChangeStep ? (
          <div className='flex flex-col min-[540px]:flex-row space-y-3 min-[540px]:space-y-0 items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Email actuel: <span className='font-medium'>{user?.email}</span>
              </p>
            </div>
            <PrimaryButton
              onClick={handleEmailChangeStart}
              disabled={changeEmailStep1State.loading}
            >
              Modifier l'email
            </PrimaryButton>
          </div>
        ) : (
          <div className='space-y-4'>
            {emailChangeStep === 'verify-current' && (
              <>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Entrez le code de vérification envoyé à votre email actuel
                </p>
                <SixDigitCodeInput
                  value={changeEmailForm.values.currentEmailCode}
                  onChange={(value) =>
                    changeEmailForm.handleChange('currentEmailCode', value)
                  }
                  onComplete={() => handleCurrentEmailVerification()}
                  error={!!changeEmailForm.errors.currentEmailCode}
                  autoFocus
                />
                <ResendAction
                  onResend={handleEmailChangeStart}
                  loading={changeEmailStep1State.loading}
                  countdownSeconds={60}
                  icon={RefreshCw}
                  variant='block'
                  align='center'
                />
                <div className='flex space-x-3'>
                  <PrimaryButton
                    onClick={handleCurrentEmailVerification}
                    loading={changeEmailStep2State.loading}
                    disabled={
                      changeEmailForm.values.currentEmailCode.join('')
                        .length !== 6 || changeEmailStep2State.loading
                    }
                  >
                    Vérifier
                  </PrimaryButton>
                  <PrimaryButton
                    variant='outline'
                    onClick={() => setEmailChangeStep(null)}
                  >
                    Annuler
                  </PrimaryButton>
                </div>
              </>
            )}

            {emailChangeStep === 'new-email' && (
              <>
                <CustomInput
                  id='new-email'
                  name='newEmail'
                  type='email'
                  label='Nouvel email'
                  placeholder='Entrer votre nouvel email'
                  value={changeEmailForm.values.newEmail}
                  onChange={(value) =>
                    changeEmailForm.handleChange('newEmail', value)
                  }
                  error={
                    changeEmailForm.touched.newEmail &&
                    changeEmailForm.values.newEmail
                      ? changeEmailForm.errors.newEmail
                      : undefined
                  }
                  icon={Mail}
                  required
                  autoFocus
                  disabled={changeEmailStep3State.loading}
                  onBlur={() => changeEmailForm.handleBlur('newEmail')}
                />
                <div className='flex space-x-3'>
                  <PrimaryButton
                    onClick={handleNewEmailSubmit}
                    loading={changeEmailStep3State.loading}
                    disabled={!changeEmailForm.values.newEmail}
                  >
                    Envoyer le code
                  </PrimaryButton>
                  <PrimaryButton
                    variant='outline'
                    onClick={() => setEmailChangeStep(null)}
                  >
                    Annuler
                  </PrimaryButton>
                </div>
              </>
            )}

            {emailChangeStep === 'verify-new' && (
              <>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Entrez le code de vérification envoyé à{' '}
                  {changeEmailForm.values.newEmail}
                </p>
                <SixDigitCodeInput
                  value={changeEmailForm.values.newEmailCode}
                  onChange={(value) =>
                    changeEmailForm.handleChange('newEmailCode', value)
                  }
                  error={!!changeEmailForm.errors.newEmailCode}
                  onComplete={() => handleNewEmailVerification()}
                  autoFocus
                />
                <ResendAction
                  onResend={handleNewEmailSubmit}
                  loading={changeEmailStep3State.loading}
                  countdownSeconds={60}
                  icon={RefreshCw}
                  variant='block'
                  align='center'
                />
                <div className='flex space-x-3'>
                  <PrimaryButton
                    onClick={handleNewEmailVerification}
                    loading={changeEmailStep4State.loading}
                    disabled={
                      changeEmailForm.values.newEmailCode.join('').length !== 6
                    }
                  >
                    Confirmer
                  </PrimaryButton>
                  <PrimaryButton
                    variant='outline'
                    onClick={() => setEmailChangeStep(null)}
                  >
                    Annuler
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        )}
      </SettingsCard>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className='space-y-6'>
      <SettingsCard
        title='Préférences de notifications'
        description='Choisissez les notifications que vous souhaitez recevoir'
        icon={Bell}
      >
        <div className='space-y-4'>
          <ToggleSwitch
            checked={notifications.accountActivity}
            onChange={(checked) =>
              setNotifications((prev) => ({
                ...prev,
                accountActivity: checked,
              }))
            }
            label='Activité du compte'
            description='Notifications de connexion, modifications de profil, etc.'
          />
          <ToggleSwitch
            checked={notifications.blogNews}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, blogNews: checked }))
            }
            label='Actualités du blog'
            description='Nouveaux articles, mises à jour importantes'
          />
          <ToggleSwitch
            checked={notifications.securityAlerts}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, securityAlerts: checked }))
            }
            label='Alertes de sécurité'
            description='Tentatives de connexion suspectes, modifications de sécurité'
          />
          <ToggleSwitch
            checked={notifications.emailDigest}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailDigest: checked }))
            }
            label='Résumé hebdomadaire'
            description='Résumé de votre activité envoyé chaque semaine'
          />
        </div>
      </SettingsCard>
    </div>
  )

  const render2FATab = () => (
    <div className='space-y-6'>
      {/* Header avec statistiques */}
      <div className='bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6'>
        <div className='mb-4 flex items-center space-x-3'>
          <Shield
            className='text-primary-600 dark:text-primary-400'
            size={24}
          />
          <h3 className='text-primary-900 dark:text-primary-100 text-lg font-semibold'>
            Configuration de la double authentification
          </h3>
        </div>
        <p className='text-primary-700 dark:text-primary-300 mb-4 text-sm'>
          La double authentification ajoute une couche de sécurité
          supplémentaire à votre compte.
        </p>
        <div className='grid grid-cols-[repeat(auto-fit,_minmax(130px,_1fr))] gap-4 text-center'>
          <div>
            <div className='text-primary-600 dark:text-primary-400 text-2xl font-bold'>
              {!getTwoFactorStatusState.loading &&
                getTwoFactorStatusState.data !== null &&
                Object.entries(getTwoFactorStatusState.data).filter(
                  ([key, value]) =>
                    key !== 'preferredMethod' &&
                    key !== 'backupCodes' &&
                    key !== 'credentials' &&
                    (value as { isEnabled?: boolean }).isEnabled,
                ).length}
              /3
            </div>
            <div className='text-primary-700 dark:text-primary-300 text-sm'>
              méthodes activées
            </div>
          </div>
          <div>
            <div className='text-primary-600 dark:text-primary-400 text-2xl font-bold'>
              {!getTwoFactorStatusState.loading
                ? getTwoFactorStatusState.data?.preferredMethod === 'webauthn'
                  ? 'Clé de sécurité'
                  : getTwoFactorStatusState.data?.preferredMethod === 'app'
                    ? 'Application'
                    : getTwoFactorStatusState.data?.preferredMethod === 'email'
                      ? 'Email'
                      : 'Aucune'
                : '...'}
            </div>
            <div className='text-primary-700 dark:text-primary-300 text-sm'>
              méthode préférée
            </div>
          </div>
          <div className='col-span-1 min-[364px]:col-span-2 min-[510px]:col-span-1'>
            <div className='text-primary-600 dark:text-primary-400 text-2xl font-bold'>
              {!getTwoFactorStatusState.loading &&
              getTwoFactorStatusState.data?.backupCodes?.length
                ? getTwoFactorStatusState.data.backupCodes.length
                : '...'}
            </div>
            <div className='text-primary-700 dark:text-primary-300 text-sm'>
              codes de secours
            </div>
          </div>
        </div>
      </div>

      {/* Méthodes 2FA */}
      <div className='grid min-[320px]:grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] gap-6'>
        <EmailTwoFactor
          isEnabled={getTwoFactorStatusState.data?.email?.isEnabled}
          isPreferredMethod={
            getTwoFactorStatusState.data?.preferredMethod === 'email'
          }
          onStatusChange={() => fetch2FAStatus()}
        />

        <AppTwoFactor
          isEnabled={getTwoFactorStatusState.data?.app?.isEnabled}
          isPreferredMethod={
            getTwoFactorStatusState.data?.preferredMethod === 'app'
          }
          onStatusChange={() => fetch2FAStatus()}
        />

        <WebAuthnTwoFactor
          isEnabled={getTwoFactorStatusState.data?.webauthn?.isEnabled}
          isPreferredMethod={
            getTwoFactorStatusState.data?.preferredMethod === 'webauthn'
          }
          credentials={getTwoFactorStatusState.data?.credentials || []}
          onStatusChange={() => fetch2FAStatus()}
        />
      </div>

      {/* Codes de secours */}
      {!getTwoFactorStatusState.loading &&
        getTwoFactorStatusState.data?.backupCodes?.length &&
        getTwoFactorStatusState.data.backupCodes.length > 0 && (
          <BackupCodesDisplay
            codes={getTwoFactorStatusState.data.backupCodes.map(
              (code: any) => code.code,
            )}
            onContinue={() => {}}
            onSkip={() => {}}
            isModal={false}
          />
        )}
    </div>
  )

  const renderAccountTab = () => (
    <div className='space-y-6'>
      {/* Téléchargement des données */}
      <SettingsCard
        title='Télécharger mes données'
        description='Obtenez une copie de toutes vos données (conforme RGPD)'
        icon={Download}
      >
        <PrimaryButton icon={Download}>Télécharger mes données</PrimaryButton>
      </SettingsCard>

      {/* Suppression du compte */}
      <SettingsCard
        title='Supprimer mon compte'
        description='Supprimez définitivement votre compte et toutes vos données'
        icon={Trash2}
        variant='danger'
      >
        <div className='space-y-4'>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/10'>
            <div className='mb-2 flex items-center space-x-2'>
              <AlertTriangle
                className='text-red-600 dark:text-red-400'
                size={16}
              />
              <span className='font-medium text-red-800 dark:text-red-200'>
                Attention : Cette action est irréversible
              </span>
            </div>
            <p className='text-sm text-red-700 dark:text-red-300'>
              Toutes vos données seront définitivement supprimées et ne pourront
              pas être récupérées.
            </p>
          </div>
          <PrimaryButton
            variant='danger'
            size='md'
            loading={deleteAccountState.loading}
            onClick={open}
          >
            Supprimer mon compte
          </PrimaryButton>
        </div>
      </SettingsCard>
    </div>
  )

  return (
    <div className='mx-auto p-2 sm:p-4 md:p-6'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Paramètres
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Gérez votre compte et vos préférences de sécurité
        </p>
      </div>

      <TabNavigation
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => {
          navigate(`/settings/${id}`)
        }}
        className='mb-8'
      />

      <div className=''>
        {tab === 'security' && renderSecurityTab()}
        {tab === 'notifications' && renderNotificationsTab()}
        {tab === '2fa' && render2FATab()}
        {tab === 'account' && renderAccountTab()}
      </div>

      {/* Modal de suppression de compte */}
      <Modal
        onClose={close}
        title='Supprimer mon compte'
        size='md'
        urlName='delete-account'
      >
        <div className='space-y-6'>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/10'>
            <div className='mb-2 flex items-center space-x-2'>
              <AlertTriangle
                className='text-red-600 dark:text-red-400'
                size={20}
              />
              <span className='font-semibold text-red-800 dark:text-red-200'>
                Cette action est irréversible
              </span>
            </div>
            <p className='text-sm text-red-700 dark:text-red-300'>
              Votre compte et toutes vos données seront définitivement
              supprimés. Cette action ne peut pas être annulée.
            </p>
          </div>

          <div className='space-y-4'>
            <CustomInput
              label="Pour confirmer, tapez 'SUPPRIMER' ou votre email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder='SUPPRIMER'
            />
            <CustomInput
              type='password'
              label='Confirmez avec votre mot de passe'
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder='Votre mot de passe'
            />
          </div>

          <div className='flex space-x-3'>
            <PrimaryButton
              onClick={handleDeleteAccount}
              loading={deleteAccountState.loading}
              disabled={
                (deleteConfirmation.toLocaleUpperCase() !== 'SUPPRIMER' &&
                  deleteConfirmation.toLocaleLowerCase() !== user?.email) ||
                !deletePassword
              }
              className='bg-red-600 text-white hover:bg-red-700'
            >
              Supprimer définitivement
            </PrimaryButton>
            <PrimaryButton variant='outline' onClick={close}>
              Annuler
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
