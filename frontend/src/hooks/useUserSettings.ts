import type { ChangePassword } from '../types/auth'
import { VITE_USER } from '../utils/env'
import { useApiCall } from './useApiCall'
import axios from 'axios'
import { useAuth } from '../context/Auth'

const deleteAccountApi = () =>
  axios.delete(`${VITE_USER}/delete-account`, {
    withCredentials: true,
  })

const changePasswordApi = (changePasswordData: ChangePassword) =>
  axios.post(`${VITE_USER}/change-password`, changePasswordData, {
    withCredentials: true,
  })

const changeEmailStep1Api = () =>
  axios.post(`${VITE_USER}/change-email/step1`, {}, { withCredentials: true })

const changeEmailStep2Api = (code: string) =>
  axios.post(
    `${VITE_USER}/change-email/step2`,
    { code },
    { withCredentials: true },
  )

const changeEmailStep3Api = (email: string) =>
  axios.post(
    `${VITE_USER}/change-email/step3`,
    { email },
    { withCredentials: true },
  )

const changeEmailStep4Api = (code: string) =>
  axios.post(
    `${VITE_USER}/change-email/step4`,
    { code },
    { withCredentials: true },
  )

const useUserSettings = () => {
  const deleteAccount = useApiCall(deleteAccountApi, {
    successMessage: 'Compte supprimé avec succès',
    errorMessage: 'Erreur lors de la suppression du compte',
    onSuccess: async () => {
      await useAuth().logout()
    },
  })

  const changePassword = useApiCall(changePasswordApi, {
    successMessage: 'Mot de passe modifié avec succès',
    errorMessage: 'Erreur lors de la modification du mot de passe',
  })

  // Email change flow
  const changeEmailStep1 = useApiCall(changeEmailStep1Api, {
    successMessage:
      'Un email de vérification a été envoyé à votre adresse mail actuelle',
    errorMessage: 'Erreur lors de la configuration',
  })

  const changeEmailStep2 = useApiCall(changeEmailStep2Api, {
    showSuccessToast: false,
    errorMessage: 'Erreur lors de la vérification du code',
  })

  const changeEmailStep3 = useApiCall(changeEmailStep3Api, {
    successMessage:
      'Un email de vérification a été envoyé à votre nouvelle adresse mail.',
    errorMessage: "Erreur lors de la modification de l'adresse email",
  })
  const changeEmailStep4 = useApiCall(changeEmailStep4Api, {
    successMessage: 'Adresse email modifiée avec succès',
    errorMessage: 'Erreur lors de la confirmation du code',
    onSuccess: async () => {
      await useAuth().checkAuth()
    },
  })
  return {
    deleteAccount: deleteAccount.execute,
    deleteAccountState: deleteAccount,
    changePassword: changePassword.execute,
    changePasswordState: changePassword,
    changeEmailStep1: changeEmailStep1.execute,
    changeEmailStep1State: changeEmailStep1,
    changeEmailStep2: changeEmailStep2.execute,
    changeEmailStep2State: changeEmailStep2,
    changeEmailStep3: changeEmailStep3.execute,
    changeEmailStep3State: changeEmailStep3,
    changeEmailStep4: changeEmailStep4.execute,
    changeEmailStep4State: changeEmailStep4,
  }
}

export default useUserSettings
