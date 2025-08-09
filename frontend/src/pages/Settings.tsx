import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUrlModal } from '../routes/UseUrlModal'
import { toast } from 'sonner'
// 2FA Components
import EmailTwoFactor from '../components/TwoFactor/EmailTwoFactor'
import AppTwoFactor from '../components/TwoFactor/AppTwoFactor'
import WebAuthnTwoFactor from '../components/TwoFactor/WebAuthnTwoFactor'
import useTwoFactorAuth from '../hooks/TwoFactor/Main'
import BackupCodesDisplay from '../components/TwoFactor/BackupCodesDisplay'
// Context & hooks
import type { PasswordStrength, Session, ChangePassword } from '../types/auth'
import { useAuth } from '../context/Auth'
import useUserSettings from '../hooks/UserSettings'
// UI components
import TabNavigation from '../components/ui/TabNavigation'
import SettingsCard from '../components/ui/SettingsCard'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import CustomInput from '../components/ui/CustomInput'
import PrimaryButton from '../components/ui/PrimaryButton'
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter'
import SixDigitCodeInput from '../components/ui/SixDigitCodeInput'
import Modal from '../components/ui/Modal'
import {
  Shield,
  Mail,
  Bell,
  Trash2,
  Key,
  Globe,
  Download,
  LogOut,
  AlertTriangle,
  Monitor,
  MapPin,
  Calendar,
} from 'lucide-react'

const SettingsPage: React.FC = () => {
  const { tab = 'security' } = useParams()
  const navigate = useNavigate()
  const { user, logout, checkActiveSessions, revokeSession } = useAuth()
  const {
    changePassword,
    changeEmailStep1,
    changeEmailStep2,
    changeEmailStep3,
    changeEmailStep4,
    deleteAccount,
  } = useUserSettings()

  const tabs = [
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: '2fa', label: 'Double authentification', icon: Key },
    { id: 'account', label: 'Compte', icon: Trash2 },
  ]
  const [isLoading, setIsLoading] = useState(false)

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState<Session[]>([])

  // 2FA state
  const { getTwoFactorStatus } = useTwoFactorAuth()

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
  const [emailForm, setEmailForm] = useState({
    currentEmailCode: Array(6).fill(''),
    newEmail: '',
    newEmailCode: Array(6).fill(''),
  })

  // 2FA state
  const [twoFactorSettings, setTwoFactorSettings] = useState({
    email: { enabled: user?.twoFactor?.email?.isEnabled || false },
    app: { enabled: user?.twoFactor?.app?.isEnabled || false },
    webauthn: { enabled: user?.twoFactor?.webauthn?.isEnabled || false },
    preferredMethod: user?.twoFactor?.preferredMethod || null,
    backupCodes: user?.twoFactor?.backupCodes || [],
    credentials: user?.twoFactor?.webauthn?.credentials || [],
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    accountActivity: true,
    blogNews: false,
    securityAlerts: true,
    emailDigest: true,
  })

  // Delete account state
  const { isOpen, open, close } = useUrlModal('delete-account')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  const fetch2FAStatus = async () => {
    const result = await getTwoFactorStatus()
    if (result.success) {
      setTwoFactorSettings({
        email: { enabled: result.email.isEnabled || false },
        app: { enabled: result.app.isEnabled || false },
        webauthn: { enabled: result.webauthn.isEnabled || false },
        preferredMethod: result.preferredMethod || null,
        backupCodes: result.backupCodes || [],
        credentials: result.credentials || [],
      })
    }
  }

  useEffect(() => {
    const fetchActiveSessions = async () => {
      const activeSessions = await checkActiveSessions()
      setActiveSessions(activeSessions)
    }

    fetchActiveSessions()
    fetch2FAStatus()
  }, [])

  useEffect(() => {
    // Auto-submit when code is complete
    const codeValue = emailForm.currentEmailCode.join('')
    if (codeValue.length === 6 && !isLoading) {
      handleCurrentEmailVerification()
    }
  }, [emailForm.currentEmailCode])

  useEffect(() => {
    // Auto-submit when code is complete
    const codeValue = emailForm.newEmailCode.join('')
    if (codeValue.length === 6 && !isLoading) {
      handleNewEmailVerification()
    }
  }, [emailForm.newEmailCode])

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

    setIsLoading(true)
    try {
      await changePassword(passwordForm, () => {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      })
    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChangeStart = async () => {
    await changeEmailStep1(() => {
      setEmailChangeStep('verify-current')
    })
  }

  const handleCurrentEmailVerification = async () => {
    setIsLoading(true)
    try {
      if (emailForm.currentEmailCode.join('').length !== 6) {
        return
      }
      await changeEmailStep2(emailForm.currentEmailCode.join(''), () =>
        setEmailChangeStep('new-email'),
      )
    } catch (error) {
      toast.error('Code de vérification incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewEmailSubmit = async () => {
    setIsLoading(true)
    try {
      await changeEmailStep3(emailForm.newEmail, () =>
        setEmailChangeStep('verify-new'),
      )
    } catch (error) {
      toast.error("Erreur lors de l'envoi du code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewEmailVerification = async () => {
    setIsLoading(true)
    try {
      await changeEmailStep4(emailForm.newEmailCode.join(''), () => {
        ;(setEmailChangeStep(null),
          user && (user.email = emailForm.newEmail),
          setEmailForm({
            currentEmailCode: Array(6).fill(''),
            newEmail: '',
            newEmailCode: Array(6).fill(''),
          }))
      })
    } catch (error) {
      toast.error('Code de vérification incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      await revokeSession(sessionId)
      const activeSessions = await checkActiveSessions()
      setActiveSessions(activeSessions)
    } catch (error) {
      toast.error('Erreur lors de la révocation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeAllSessions = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const activeSessions = await checkActiveSessions()
      setActiveSessions(activeSessions)
    } catch (error) {
      toast.error('Erreur lors de la révocation')
    } finally {
      setIsLoading(false)
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

    setIsLoading(true)
    try {
      await deleteAccount(() => {
        setDeleteConfirmation('')
        logout(() => {
          ;() => {
            navigate('/auth/login')
          }
        })
      })
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  const renderSecurityTab = () => (
    <div className='space-y-6'>
      {/* Sessions actives */}
      <SettingsCard
        title='Sessions actives'
        description='Gérez vos sessions de connexion'
        icon={Monitor}
      >
        <div className='space-y-4'>
          {activeSessions.map((session) => (
            <div
              key={session.sessionId}
              className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'
            >
              <div className='flex items-center space-x-3'>
                <div className='flex-shrink-0'>
                  <Monitor size={20} className='text-gray-500' />
                </div>
                <div>
                  <div className='flex items-center space-x-2'>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      {session.device}
                    </span>
                    {session.isCurrent && (
                      <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400'>
                        Session actuelle
                      </span>
                    )}
                  </div>
                  <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                    <span className='flex items-center space-x-1'>
                      <Globe size={14} />
                      <span>{session.ip}</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <MapPin size={14} />
                      <span>{session.location || 'Localisation inconnue'}</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <Calendar size={14} />
                      <span>
                        {new Date(session.lastActive).toLocaleString()}
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
                  loading={isLoading}
                >
                  Révoquer
                </PrimaryButton>
              )}
            </div>
          ))}
          {activeSessions.length !== 1 && (
            <PrimaryButton
              variant='secondary'
              onClick={handleRevokeAllSessions}
              loading={isLoading}
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
            loading={isLoading}
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
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Email actuel: <span className='font-medium'>{user?.email}</span>
              </p>
            </div>
            <PrimaryButton onClick={handleEmailChangeStart}>
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
                  value={emailForm.currentEmailCode}
                  onChange={(value) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      currentEmailCode: value,
                    }))
                  }
                  autoFocus
                />
                <div className='flex space-x-3'>
                  <PrimaryButton
                    onClick={handleCurrentEmailVerification}
                    loading={isLoading}
                    disabled={emailForm.currentEmailCode.join('').length !== 6}
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
                  type='email'
                  label='Nouvel email'
                  value={emailForm.newEmail}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  required
                />
                <div className='flex space-x-3'>
                  <PrimaryButton
                    onClick={handleNewEmailSubmit}
                    loading={isLoading}
                    disabled={!emailForm.newEmail}
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
                  Entrez le code de vérification envoyé à {emailForm.newEmail}
                </p>
                <SixDigitCodeInput
                  value={emailForm.newEmailCode}
                  onChange={(value) =>
                    setEmailForm((prev) => ({ ...prev, newEmailCode: value }))
                  }
                />
                <div className='flex space-x-3'>
                  <PrimaryButton
                    onClick={handleNewEmailVerification}
                    loading={isLoading}
                    disabled={emailForm.newEmailCode.join('').length !== 6}
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
        <div className='flex items-center space-x-3 mb-4'>
          <Shield
            className='text-primary-600 dark:text-primary-400'
            size={24}
          />
          <h3 className='text-lg font-semibold text-primary-900 dark:text-primary-100'>
            Configuration de la double authentification
          </h3>
        </div>
        <p className='text-primary-700 dark:text-primary-300 text-sm mb-4'>
          La double authentification ajoute une couche de sécurité
          supplémentaire à votre compte.
        </p>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
              {
                Object.entries(twoFactorSettings).filter(
                  ([key, value]) =>
                    key !== 'preferredMethod' &&
                    key !== 'backupCodes' &&
                    key !== 'credentials' &&
                    (value as { enabled?: boolean }).enabled,
                ).length
              }
              /3
            </div>
            <div className='text-sm text-primary-700 dark:text-primary-300'>
              méthodes activées
            </div>
          </div>
          <div>
            <div className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
              {twoFactorSettings.preferredMethod === 'none'
                ? 'Aucune'
                : twoFactorSettings.preferredMethod === 'webauthn'
                  ? 'Clé de sécurité'
                  : twoFactorSettings.preferredMethod === 'app'
                    ? 'Application'
                    : 'Email'}
            </div>
            <div className='text-sm text-primary-700 dark:text-primary-300'>
              méthode préférée
            </div>
          </div>
          <div>
            <div className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
              {twoFactorSettings.backupCodes.length}
            </div>
            <div className='text-sm text-primary-700 dark:text-primary-300'>
              codes de secours
            </div>
          </div>
        </div>
      </div>

      {/* Méthodes 2FA */}
      <div className='grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-6'>
        <EmailTwoFactor
          isEnabled={twoFactorSettings.email.enabled}
          isPreferredMethod={twoFactorSettings.preferredMethod === 'email'}
          onStatusChange={() => fetch2FAStatus()}
        />

        <AppTwoFactor
          isEnabled={twoFactorSettings.app.enabled}
          isPreferredMethod={twoFactorSettings.preferredMethod === 'app'}
          onStatusChange={() => fetch2FAStatus()}
        />

        <WebAuthnTwoFactor
          isEnabled={twoFactorSettings.webauthn.enabled}
          isPreferredMethod={twoFactorSettings.preferredMethod === 'webauthn'}
          credentials={twoFactorSettings.credentials || []}
          onStatusChange={() => fetch2FAStatus()}
        />
      </div>

      {/* Codes de secours */}
      {twoFactorSettings.backupCodes &&
        twoFactorSettings.backupCodes.length > 0 && (
          <BackupCodesDisplay
            codes={twoFactorSettings.backupCodes.map((code: any) => code.code)}
            onContinue={() => {}}
            onSkip={() => {}}
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
          <div className='bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4'>
            <div className='flex items-center space-x-2 mb-2'>
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
            variant='secondary'
            onClick={open}
            className='bg-red-600 hover:bg-red-700 text-white'
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
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
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
        isOpen={isOpen}
        onClose={close}
        title='Supprimer mon compte'
        size='md'
      >
        <div className='space-y-6'>
          <div className='bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4'>
            <div className='flex items-center space-x-2 mb-2'>
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
              loading={isLoading}
              disabled={
                (deleteConfirmation.toLocaleUpperCase() !== 'SUPPRIMER' &&
                  deleteConfirmation.toLocaleLowerCase() !== user?.email) ||
                !deletePassword
              }
              className='bg-red-600 hover:bg-red-700 text-white'
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
