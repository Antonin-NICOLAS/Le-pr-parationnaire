import type { ChangePassword } from '../types/auth'
import axios from 'axios'
import { toast } from 'sonner'

import.meta.env.VITE_USER =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/user' : '/api/user'

const useUserSettings = () => {
  const changePassword = async (
    changePasswordData: ChangePassword,
    onSuccess: () => void,
  ) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_USER}/change-password`,
        changePasswordData,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Mot de passe modifié avec succès !')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  // Email change flow
  const changeEmailStep1 = async (onSuccess: () => void) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_USER}/change-email/step1`,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Code de vérification envoyé.')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const changeEmailStep2 = async (code: string, onSuccess: () => void) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_USER}/change-email/step2`,
        { code },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(
          data.message || 'Vous pouvez maintenant entrer votre nouvel email.',
        )
        onSuccess()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const changeEmailStep3 = async (email: string, onSuccess: () => void) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_USER}/change-email/step3`,
        { email },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Email modifié avec succès.')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const changeEmailStep4 = async (code: string, onSuccess: () => void) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_USER}/change-email/step4`,
        { code },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Email vérifié avec succès.')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const deleteAccount = async (onSuccess: () => void) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_USER}/delete-account`,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Compte supprimé avec succès.')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  return {
    changePassword,
    changeEmailStep1,
    changeEmailStep2,
    changeEmailStep3,
    changeEmailStep4,
    deleteAccount,
  }
}

export default useUserSettings
