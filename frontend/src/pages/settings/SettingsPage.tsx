import React, { useState } from 'react'
import {
  Shield,
  Mail,
  Bell,
  Trash2,
  Key,
  Smartphone,
  Globe,
  Download,
  LogOut,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Monitor,
  MapPin,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/Auth'
import TabNavigation from '../../components/ui/TabNavigation'
import SettingsCard from '../../components/ui/SettingsCard'
import ToggleSwitch from '../../components/ui/ToggleSwitch'
import CustomInput from '../../components/ui/CustomInput'
import PrimaryButton from '../../components/ui/PrimaryButton'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import SixDigitCodeInput from '../../components/ui/SixDigitCodeInput'
import Modal from '../../components/ui/Modal'
import type { PasswordStrength } from '../../types/auth'

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('security')
  const [isLoading, setIsLoading] = useState(false)

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
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
  })
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes] = useState([
    '3A5B7C9D',
    '8E2F4G6H',
    '1I3J5K7L',
    '9M1N3O5P',
    '2Q4R6S8T',
    '7U9V1W3X',
    '4Y6Z8A0B',
    '5C7D9E1F',
  ])

  // Notification preferences
  const [notifications, setNotifications] = useState({
    accountActivity: true,
    blogNews: false,
    securityAlerts: true,
    emailDigest: true,
  })

  // Delete account state
  const [deleteAccountModal, setDeleteAccountModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  // Sessions state (mock data)
  const [activeSessions] = useState([
    {
      id: '1',
      ip: '192.168.1.100',
      location: 'Paris, France',
      device: 'Chrome on macOS',
      lastActive: new Date('2024-01-15T10:30:00'),
      isCurrent: true,
    },
    {
      id: '2',
      ip: '10.0.0.50',
      location: 'Lyon, France',
      device: 'Safari on iPhone',
      lastActive: new Date('2024-01-14T15:45:00'),
      isCurrent: false,
    },
  ])

  const tabs = [
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: '2fa', label: 'Double authentification', icon: Key },
    { id: 'account', label: 'Compte', icon: Trash2 },
  ]

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success('Mot de passe modifié avec succès')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChangeStart = () => {
    setEmailChangeStep('verify-current')
  }

  const handleCurrentEmailVerification = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEmailChangeStep('new-email')
      toast.success('Email actuel vérifié')
    } catch (error) {
      toast.error('Code de vérification incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewEmailSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEmailChangeStep('verify-new')
      toast.success('Code envoyé à votre nouvel email')
    } catch (error) {
      toast.error("Erreur lors de l'envoi du code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewEmailVerification = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success('Email modifié avec succès')
      setEmailChangeStep(null)
      setEmailForm({
        currentEmailCode: Array(6).fill(''),
        newEmail: '',
        newEmailCode: Array(6).fill(''),
      })
    } catch (error) {
      toast.error('Code de vérification incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle2FA = async (
    method: 'email' | 'app' | 'webauthn',
    enabled: boolean,
  ) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTwoFactorSettings((prev) => ({
        ...prev,
        [method]: { enabled },
      }))
      toast.success(`2FA ${method} ${enabled ? 'activée' : 'désactivée'}`)
    } catch (error) {
      toast.error('Erreur lors de la modification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Session révoquée')
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
      toast.success('Toutes les sessions ont été révoquées')
    } catch (error) {
      toast.error('Erreur lors de la révocation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      deleteConfirmation.toLowerCase() !== 'supprimer' &&
      deleteConfirmation !== user?.email
    ) {
      toast.error('Confirmation incorrecte')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success('Compte supprimé')
      logout(() => {})
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers')
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Codes de sauvegarde téléchargés')
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
              key={session.id}
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
                      <span>{session.location}</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <Calendar size={14} />
                      <span>{session.lastActive.toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <PrimaryButton
                  variant='outline'
                  size='sm'
                  onClick={() => handleRevokeSession(session.id)}
                  loading={isLoading}
                >
                  Révoquer
                </PrimaryButton>
              )}
            </div>
          ))}
          <PrimaryButton
            variant='secondary'
            onClick={handleRevokeAllSessions}
            loading={isLoading}
            icon={LogOut}
          >
            Déconnecter toutes les sessions
          </PrimaryButton>
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
              {twoFactorSettings.preferredMethod || 'Aucune'}
            </div>
            <div className='text-sm text-primary-700 dark:text-primary-300'>
              méthode préférée
            </div>
          </div>
          <div>
            <div className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
              {backupCodes.length}
            </div>
            <div className='text-sm text-primary-700 dark:text-primary-300'>
              codes de secours
            </div>
          </div>
        </div>
      </div>

      {/* Méthodes 2FA */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Email */}
        <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <Mail className='text-blue-600 dark:text-blue-400' size={20} />
            </div>
            <div>
              <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                Email
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Codes temporaires par email
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between mb-4'>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                twoFactorSettings.email.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {twoFactorSettings.email.enabled ? 'Activé' : 'Désactivé'}
            </span>
            {twoFactorSettings.preferredMethod === 'email' && (
              <span className='px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs dark:bg-primary-900/20 dark:text-primary-400'>
                Préférée
              </span>
            )}
          </div>
          <PrimaryButton
            variant={twoFactorSettings.email.enabled ? 'secondary' : 'primary'}
            size='sm'
            fullWidth
            onClick={() =>
              handleToggle2FA('email', !twoFactorSettings.email.enabled)
            }
            loading={isLoading}
          >
            {twoFactorSettings.email.enabled ? 'Désactiver' : 'Activer'}
          </PrimaryButton>
        </div>

        {/* App */}
        <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
              <Smartphone
                className='text-green-600 dark:text-green-400'
                size={20}
              />
            </div>
            <div>
              <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                Application
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Google Authenticator, Authy
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between mb-4'>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                twoFactorSettings.app.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {twoFactorSettings.app.enabled ? 'Activé' : 'Désactivé'}
            </span>
            {twoFactorSettings.preferredMethod === 'app' && (
              <span className='px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs dark:bg-primary-900/20 dark:text-primary-400'>
                Préférée
              </span>
            )}
          </div>
          <PrimaryButton
            variant={twoFactorSettings.app.enabled ? 'secondary' : 'primary'}
            size='sm'
            fullWidth
            onClick={() =>
              handleToggle2FA('app', !twoFactorSettings.app.enabled)
            }
            loading={isLoading}
          >
            {twoFactorSettings.app.enabled ? 'Désactiver' : 'Activer'}
          </PrimaryButton>
        </div>

        {/* WebAuthn */}
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
                twoFactorSettings.webauthn.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {twoFactorSettings.webauthn.enabled ? 'Activé' : 'Désactivé'}
            </span>
            {twoFactorSettings.preferredMethod === 'webauthn' && (
              <span className='px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs dark:bg-primary-900/20 dark:text-primary-400'>
                Préférée
              </span>
            )}
          </div>
          <PrimaryButton
            variant={
              twoFactorSettings.webauthn.enabled ? 'secondary' : 'primary'
            }
            size='sm'
            fullWidth
            onClick={() =>
              handleToggle2FA('webauthn', !twoFactorSettings.webauthn.enabled)
            }
            loading={isLoading}
          >
            {twoFactorSettings.webauthn.enabled ? 'Désactiver' : 'Activer'}
          </PrimaryButton>
        </div>
      </div>

      {/* Codes de secours */}
      {Object.values(twoFactorSettings)
        .filter(
          (method): method is { enabled: boolean } =>
            typeof method === 'object' &&
            method !== null &&
            'enabled' in method,
        )
        .some((method) => method.enabled) && (
        <SettingsCard
          title='Codes de secours'
          description="Utilisez ces codes si vous perdez l'accès à vos autres méthodes"
          icon={Shield}
          variant='warning'
        >
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Codes de sauvegarde</span>
              <div className='flex space-x-2'>
                <PrimaryButton
                  variant='outline'
                  size='sm'
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  icon={showBackupCodes ? EyeOff : Eye}
                >
                  {showBackupCodes ? 'Masquer' : 'Afficher'}
                </PrimaryButton>
                <PrimaryButton
                  variant='outline'
                  size='sm'
                  onClick={downloadBackupCodes}
                  icon={Download}
                >
                  Télécharger
                </PrimaryButton>
              </div>
            </div>

            {showBackupCodes && (
              <div className='bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4'>
                <div className='flex items-center space-x-2 mb-3'>
                  <AlertTriangle
                    className='text-yellow-600 dark:text-yellow-400'
                    size={16}
                  />
                  <span className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                    Stockez ces codes dans un endroit sûr
                  </span>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2'
                    >
                      <span className='font-mono text-sm'>{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className='mt-3 flex space-x-2'>
                  <PrimaryButton variant='outline' size='sm' icon={RefreshCw}>
                    Régénérer les codes
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </SettingsCard>
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
            onClick={() => setDeleteAccountModal(true)}
            className='bg-red-600 hover:bg-red-700 text-white'
          >
            Supprimer mon compte
          </PrimaryButton>
        </div>
      </SettingsCard>
    </div>
  )

  return (
    <div className='max-w-6xl mx-auto p-6'>
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className='mb-8'
      />

      <div className='min-h-[600px]'>
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === '2fa' && render2FATab()}
        {activeTab === 'account' && renderAccountTab()}
      </div>

      {/* Modal de suppression de compte */}
      <Modal
        isOpen={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
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
              label="Pour confirmer, tapez 'supprimer' ou votre email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder='supprimer'
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
                (deleteConfirmation.toLowerCase() !== 'supprimer' &&
                  deleteConfirmation !== user?.email) ||
                !deletePassword
              }
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              Supprimer définitivement
            </PrimaryButton>
            <PrimaryButton
              variant='outline'
              onClick={() => setDeleteAccountModal(false)}
            >
              Annuler
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
