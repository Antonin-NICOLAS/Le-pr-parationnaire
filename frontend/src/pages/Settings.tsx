import {
  AlertTriangle,
  Bell,
  Calendar,
  Download,
  CloudDownload,
  Globe,
  Key,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Shield,
  Trash2,
  CircleX,
  RefreshCw,
  Lock,
  KeyRound,
  Pen,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
import useUserSettings from '../hooks/useUserSettings'
import { useUrlModal } from '../routes/UseUrlModal'
import type { LoginHistory } from '../types/user'
import useSessions from '../hooks/Auth/useSessions'
import ResendSection from '../components/ui/ResendSection'
import { useFormHandler } from '../hooks/useFormHandler'
import { changeEmailSchema, changePasswordSchema } from '../utils/validation'
import WebAuthnPrimary from '../components/Auth/WebAuthnPrimary'
import TwoFactorMain from '../components/Auth/TwoFactorMain'

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

  // Email/password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
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
  const changePasswordForm = useFormHandler({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: changePasswordSchema,
    validateOnChange: true,
    validateOnBlur: false,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: 'beforeChildren',
        duration: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween' as const,
        ease: 'easeOut' as const,
        duration: 0.2,
      },
    },
  }

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

  const handlePasswordChange = async () => {
    const result = await changePassword(changePasswordForm.values)
    if (result.success) {
      changePasswordForm.reset()
    }
  }

  const handleEmailChangeStart = async () => {
    changeEmailStep1State.resetError()
    changeEmailForm.clearErrors()
    const result = await changeEmailStep1()
    if (result.success) {
      setEmailChangeStep('verify-current')
    }
  }

  const handleCurrentEmailVerification = async () => {
    changeEmailStep2State.resetError()
    changeEmailForm.clearErrors()
    const result = await changeEmailStep2(
      changeEmailForm.values.currentEmailCode.join(''),
    )
    if (result.success) {
      setEmailChangeStep('new-email')
    }
  }

  const handleNewEmailSubmit = async () => {
    changeEmailStep3State.resetError()
    changeEmailForm.clearErrors()
    const result = await changeEmailStep3(changeEmailForm.values.newEmail)
    if (result.success) {
      setEmailChangeStep('verify-new')
    }
  }

  const handleNewEmailVerification = async () => {
    changeEmailStep4State.resetError()
    changeEmailForm.clearErrors()
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
      {/* Sessions actives */}
      <SettingsCard
        title='Sessions actives'
        description='Gérez vos sessions de connexion'
        icon={Monitor}
      >
        <motion.div
          className='space-y-4'
          variants={containerVariants}
          initial='hidden'
          animate='show'
        >
          {!checkActiveSessionsState.loading &&
          checkActiveSessionsState.data?.sessions?.length ? (
            checkActiveSessionsState.data.sessions.map(
              (session: LoginHistory) => (
                <motion.div
                  key={session.sessionId}
                  variants={itemVariants}
                  className='flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'
                  whileHover={{ scale: 1.007 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 13 }}
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
                      disabled={
                        revokeSessionState.loading ||
                        revokeAllSessionsState.loading
                      }
                      loading={
                        revokeSessionState.loading ||
                        revokeAllSessionsState.loading
                      }
                    >
                      Révoquer
                    </PrimaryButton>
                  )}
                </motion.div>
              ),
            )
          ) : (
            <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
              {checkActiveSessionsState.loading ? (
                <motion.div
                  className='space-y-4'
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1,
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='h-20 rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse'
                    />
                  ))}
                </motion.div>
              ) : (
                'Aucune session active trouvée'
              )}
            </div>
          )}
          {!checkActiveSessionsState.loading &&
            checkActiveSessionsState.data?.sessions?.length &&
            checkActiveSessionsState.data.sessions.length !== 1 && (
              <PrimaryButton
                variant='secondary'
                onClick={handleRevokeAllSessions}
                disabled={
                  revokeSessionState.loading || revokeAllSessionsState.loading
                }
                loading={
                  revokeSessionState.loading || revokeAllSessionsState.loading
                }
                icon={LogOut}
              >
                Déconnecter toutes les sessions
              </PrimaryButton>
            )}
        </motion.div>
      </SettingsCard>

      <motion.div
        className='flex gap-6 min-[1000px]:flex-row flex-col'
        initial='hidden'
        animate='show'
        variants={containerVariants}
        style={{
          gridTemplateColumns: 'minmax(35%, 1fr) minmax(45%, 1.5fr)',
        }}
      >
        <motion.div
          variants={itemVariants}
          className='min-w-0 flex-1'
          style={{
            flex: '1 1 35%',
            minWidth: 'min(100%, 400px)',
          }}
        >
          <SettingsCard
            title='Changer le mot de passe'
            description='Modifiez votre mot de passe actuel'
            icon={Key}
            className='min-w-[calc(50%-0.75rem)]'
          >
            {showPasswordForm ? (
              <motion.form
                onSubmit={handlePasswordChange}
                className='space-y-4'
                initial='hidden'
                animate='show'
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <CustomInput
                    type='password'
                    label='Mot de passe actuel'
                    placeholder='Entrez votre mot de passe actuel'
                    value={changePasswordForm.values.currentPassword}
                    onChange={(e) =>
                      changePasswordForm.handleChange(
                        'currentPassword',
                        e.target.value,
                      )
                    }
                    error={
                      changePasswordForm.touched.currentPassword &&
                      changePasswordForm.values.currentPassword
                        ? changePasswordForm.errors.currentPassword
                        : undefined
                    }
                    icon={Lock}
                    required
                    autoComplete='current-password'
                    disabled={changePasswordState.loading}
                    onBlur={() =>
                      changePasswordForm.handleBlur('currentPassword')
                    }
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CustomInput
                    type='password'
                    label='Nouveau mot de passe'
                    placeholder='Entrez votre nouveau mot de passe'
                    value={changePasswordForm.values.newPassword}
                    onChange={(e) =>
                      changePasswordForm.handleChange(
                        'newPassword',
                        e.target.value,
                      )
                    }
                    icon={KeyRound}
                    error={
                      changePasswordForm.touched.newPassword &&
                      changePasswordForm.values.newPassword
                        ? changePasswordForm.errors.newPassword
                        : undefined
                    }
                    required
                    autoComplete='new-password'
                    disabled={changePasswordState.loading}
                    onBlur={() => changePasswordForm.handleBlur('newPassword')}
                  />
                </motion.div>
                {changePasswordForm.values.newPassword && (
                  <PasswordStrengthMeter
                    password={changePasswordForm.values.newPassword}
                    onStrengthChange={() => {}}
                  />
                )}
                <motion.div variants={itemVariants}>
                  <CustomInput
                    type='password'
                    label='Confirmer le nouveau mot de passe'
                    placeholder='Confirmez votre nouveau mot de passe'
                    value={changePasswordForm.values.confirmPassword}
                    onChange={(e) =>
                      changePasswordForm.handleChange(
                        'confirmPassword',
                        e.target.value,
                      )
                    }
                    icon={KeyRound}
                    error={
                      changePasswordForm.touched.confirmPassword &&
                      changePasswordForm.values.confirmPassword
                        ? changePasswordForm.errors.confirmPassword
                        : undefined
                    }
                    required
                    autoComplete='new-password'
                    disabled={changePasswordState.loading}
                    onBlur={() =>
                      changePasswordForm.handleBlur('confirmPassword')
                    }
                  />
                </motion.div>
                <motion.div variants={itemVariants} className='flex space-x-3'>
                  <PrimaryButton
                    type='submit'
                    loading={changePasswordState.loading}
                    icon={Pen}
                    disabled={
                      !changePasswordForm.values.currentPassword ||
                      !changePasswordForm.values.newPassword ||
                      !changePasswordForm.values.confirmPassword
                    }
                  >
                    Modifier le mot de passe
                  </PrimaryButton>
                  <PrimaryButton
                    variant='outline'
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Annuler
                  </PrimaryButton>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex ${
                  user?.email &&
                  (user.email.length > 25
                    ? 'max-[540px]:flex-col min-[540px]:flex-row'
                    : user.email.length > 15
                      ? 'max-[460px]:flex-col flex-row'
                      : 'flex-row')
                } gap-3 items-center justify-between`}
              >
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Cliquez pour modifier votre mot de passe
                </p>
                <PrimaryButton
                  onClick={() => setShowPasswordForm(true)}
                  icon={Pen}
                >
                  Modifier
                </PrimaryButton>
              </motion.div>
            )}
          </SettingsCard>
        </motion.div>

        {/* Changer l'email */}
        <motion.div
          variants={itemVariants}
          className='min-w-0 flex-1'
          style={{
            flex: '1.5 1 45%',
            minWidth: 'min(100%, 500px)',
          }}
        >
          <SettingsCard
            title="Changer d'adresse email"
            description='Modifiez votre adresse email de connexion'
            icon={Mail}
            className='min-w-[calc(50%-0.75rem)]'
          >
            {!emailChangeStep ? (
              <motion.div
                className={`flex ${
                  user?.email &&
                  (user.email.length > 25
                    ? 'max-[540px]:flex-col min-[540px]:flex-row'
                    : user.email.length > 15
                      ? 'max-[460px]:flex-col flex-row'
                      : 'flex-row')
                } gap-3 items-center justify-between`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className='min-w-0'>
                  {' '}
                  {/* Prevents text overflow */}
                  <p className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                    Email actuel:{' '}
                    <span className='font-medium'>{user?.email}</span>
                  </p>
                </div>
                <PrimaryButton
                  onClick={handleEmailChangeStart}
                  icon={Pen}
                  disabled={changeEmailStep1State.loading}
                  loading={changeEmailStep1State.loading}
                  className='flex-shrink-0'
                >
                  Modifier
                </PrimaryButton>
              </motion.div>
            ) : (
              <motion.div
                initial='hidden'
                animate='show'
                variants={containerVariants}
              >
                {emailChangeStep === 'verify-current' && (
                  <motion.div variants={itemVariants} className='space-y-4'>
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
                    <ResendSection
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
                  </motion.div>
                )}

                {emailChangeStep === 'new-email' && (
                  <motion.div variants={itemVariants} className='space-y-4'>
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
                  </motion.div>
                )}

                {emailChangeStep === 'verify-new' && (
                  <motion.div variants={itemVariants} className='space-y-4'>
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
                    <ResendSection
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
                          changeEmailForm.values.newEmailCode.join('')
                            .length !== 6
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
                  </motion.div>
                )}
              </motion.div>
            )}
          </SettingsCard>
        </motion.div>
      </motion.div>

      {/* Security Switches */}
      <SettingsCard
        title='Paramètres de sécurité'
        description='Configurez vos options de sécurité avancées'
        icon={Shield}
      >
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='show'
          className='space-y-4'
        >
          <motion.div variants={itemVariants}>
            <TwoFactorMain
              isEnabled={getTwoFactorStatusState.data?.isEnabled || false}
              availableMethods={
                getTwoFactorStatusState.data &&
                typeof getTwoFactorStatusState.data === 'object' &&
                Object.entries(getTwoFactorStatusState.data)
                  .filter(
                    ([key, value]) =>
                      (key === 'email' ||
                        key === 'app' ||
                        key === 'webauthn') &&
                      (value as { isEnabled?: boolean }).isEnabled,
                  )
                  .map(([key]) => key as 'email' | 'app' | 'webauthn')
              }
              primaryCredentials={
                getTwoFactorStatusState.data?.primaryCredentials || []
              }
              secondaryCredentials={
                getTwoFactorStatusState.data?.secondaryCredentials || []
              }
              onStatusChange={() => fetch2FAStatus()}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <WebAuthnPrimary
              isEnabled={
                getTwoFactorStatusState.data?.loginWithWebAuthn || false
              }
              primaryCredentials={
                getTwoFactorStatusState.data?.primaryCredentials || []
              }
              secondaryCredentials={
                getTwoFactorStatusState.data?.secondaryCredentials || []
              }
              onStatusChange={() => fetch2FAStatus()}
            />
          </motion.div>
        </motion.div>
      </SettingsCard>
    </div>
  )

  const renderNotificationsTab = () => (
    <motion.div
      className='space-y-6'
      variants={containerVariants}
      initial='hidden'
      animate='show'
    >
      <motion.div variants={itemVariants}>
        <SettingsCard
          title='Préférences de notifications'
          description='Choisissez les notifications que vous souhaitez recevoir'
          icon={Bell}
        >
          <motion.div className='space-y-4' variants={containerVariants}>
            <motion.div variants={itemVariants}>
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
            </motion.div>

            <motion.div variants={itemVariants}>
              <ToggleSwitch
                checked={notifications.blogNews}
                onChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, blogNews: checked }))
                }
                label='Actualités du blog'
                description='Nouveaux articles, mises à jour importantes'
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ToggleSwitch
                checked={notifications.securityAlerts}
                onChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    securityAlerts: checked,
                  }))
                }
                label='Alertes de sécurité'
                description='Tentatives de connexion suspectes, modifications de sécurité'
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ToggleSwitch
                checked={notifications.emailDigest}
                onChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    emailDigest: checked,
                  }))
                }
                label='Résumé hebdomadaire'
                description='Résumé de votre activité envoyé chaque semaine'
              />
            </motion.div>
          </motion.div>
        </SettingsCard>
      </motion.div>
    </motion.div>
  )

  const render2FATab = () => (
    <motion.div
      className='space-y-6'
      variants={containerVariants}
      initial='hidden'
      animate='show'
    >
      {/* Header with statistics */}
      <motion.div variants={itemVariants}>
        <div className='bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6'>
          <motion.div
            className='mb-4 flex items-center space-x-3'
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Shield
                className='text-primary-600 dark:text-primary-400'
                size={24}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className='text-primary-900 dark:text-primary-100 text-lg font-semibold'>
                Configuration de la double authentification
              </h3>
            </motion.div>
          </motion.div>

          <motion.p
            className='text-primary-700 dark:text-primary-300 mb-4 text-sm'
            variants={itemVariants}
          >
            La double authentification ajoute une couche de sécurité
            supplémentaire à votre compte.
          </motion.p>

          <motion.div
            className='grid grid-cols-[repeat(auto-fit,_minmax(130px,_1fr))] gap-4 text-center'
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <div className='text-primary-600 dark:text-primary-400 text-2xl font-bold'>
                {!getTwoFactorStatusState.loading &&
                  getTwoFactorStatusState.data !== null &&
                  Object.entries(getTwoFactorStatusState.data).filter(
                    ([key, value]) =>
                      key !== 'preferredMethod' &&
                      key !== 'backupCodes' &&
                      key !== 'primaryCredentials' &&
                      key !== 'secondaryCredentials' &&
                      key !== 'loginWithWebAuthn' &&
                      (value as { isEnabled?: boolean }).isEnabled,
                  ).length}
                /3
              </div>
              <div className='text-primary-700 dark:text-primary-300 text-sm'>
                méthodes activées
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className='text-primary-600 dark:text-primary-400 text-2xl font-bold'>
                {!getTwoFactorStatusState.loading
                  ? getTwoFactorStatusState.data?.preferredMethod === 'webauthn'
                    ? 'Clé de sécurité'
                    : getTwoFactorStatusState.data?.preferredMethod === 'app'
                      ? 'Application'
                      : getTwoFactorStatusState.data?.preferredMethod ===
                          'email'
                        ? 'Email'
                        : 'Aucune'
                  : '...'}
              </div>
              <div className='text-primary-700 dark:text-primary-300 text-sm'>
                méthode préférée
              </div>
            </motion.div>

            <motion.div
              className='col-span-1 min-[364px]:col-span-2 min-[510px]:col-span-1'
              variants={itemVariants}
            >
              <div className='text-primary-600 dark:text-primary-400 text-2xl font-bold'>
                {!getTwoFactorStatusState.loading &&
                getTwoFactorStatusState.data?.backupCodes?.length
                  ? getTwoFactorStatusState.data.backupCodes.length
                  : '...'}
              </div>
              <div className='text-primary-700 dark:text-primary-300 text-sm'>
                codes de secours
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* 2FA Methods */}
      <motion.div
        className='grid min-[320px]:grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] gap-6'
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <EmailTwoFactor
            isEnabled={getTwoFactorStatusState.data?.email?.isEnabled}
            isPreferredMethod={
              getTwoFactorStatusState.data?.preferredMethod === 'email'
            }
            onStatusChange={() => fetch2FAStatus()}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AppTwoFactor
            isEnabled={getTwoFactorStatusState.data?.app?.isEnabled}
            isPreferredMethod={
              getTwoFactorStatusState.data?.preferredMethod === 'app'
            }
            onStatusChange={() => fetch2FAStatus()}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WebAuthnTwoFactor
            isEnabled={getTwoFactorStatusState.data?.webauthn?.isEnabled}
            isPreferredMethod={
              getTwoFactorStatusState.data?.preferredMethod === 'webauthn'
            }
            credentials={
              getTwoFactorStatusState.data?.secondaryCredentials || []
            }
            onStatusChange={() => fetch2FAStatus()}
          />
        </motion.div>
      </motion.div>

      {/* Backup Codes */}
      {!getTwoFactorStatusState.loading &&
        getTwoFactorStatusState.data?.backupCodes?.length > 0 && (
          <motion.div variants={itemVariants}>
            <BackupCodesDisplay
              codes={getTwoFactorStatusState.data.backupCodes.map(
                (code: any) => code.code,
              )}
              onContinue={() => {}}
              onSkip={() => {}}
              isModal={false}
            />
          </motion.div>
        )}
    </motion.div>
  )

  const renderAccountTab = () => (
    <motion.div
      className='space-y-6'
      variants={containerVariants}
      initial='hidden'
      animate='show'
    >
      {/* Data Download */}
      <motion.div variants={itemVariants}>
        <SettingsCard
          title='Télécharger mes données'
          description='Obtenez une copie de toutes vos données (conforme RGPD)'
          icon={Download}
        >
          <PrimaryButton icon={CloudDownload}>
            Télécharger mes données
          </PrimaryButton>
        </SettingsCard>
      </motion.div>

      {/* Account Deletion */}
      <motion.div variants={itemVariants}>
        <SettingsCard
          title='Supprimer mon compte'
          description='Supprimez définitivement votre compte et toutes vos données'
          icon={Trash2}
          variant='danger'
        >
          <motion.div className='space-y-4' variants={containerVariants}>
            <motion.div
              variants={itemVariants}
              className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/10'
              whileHover={{ x: 2 }}
            >
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
                Toutes vos données seront définitivement supprimées et ne
                pourront pas être récupérées.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <PrimaryButton
                variant='danger'
                size='md'
                icon={CircleX}
                disabled={deleteAccountState.loading}
                loading={deleteAccountState.loading}
                onClick={open}
              >
                Supprimer mon compte
              </PrimaryButton>
            </motion.div>
          </motion.div>
        </SettingsCard>
      </motion.div>
    </motion.div>
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
                !deletePassword ||
                deleteAccountState.loading
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
