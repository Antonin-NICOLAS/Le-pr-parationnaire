import axios from 'axios'
import { toast } from 'sonner'

import.meta.env.VITE_2FA =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa'
    : '/api/auth/2fa'

const useEmailTwoFactor = () => {
  const configureEmail = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/email/config`,
        {},
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || 'Code de vérification envoyé par email')
        return true
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la configuration',
      )
      return false
    }
  }

  const resendCode = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/email/resend`,
        {},
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || 'Code de vérification envoyé par email')
        return true
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la configuration',
      )
      return false
    }
  }

  const enableEmail = async (code: string) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/email/enable`,
        { code },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || '2FA par email activée avec succès')
        return {
          success: true,
          backupCodes: data.backupCodes,
          preferredMethod: data.preferredMethod,
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Code invalide')
      return { success: false }
    }
  }

  const disableEmail = async (method: 'otp' | 'password', value: string) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/email/disable`,
        { method, value },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success('2FA par email désactivée')
        return true
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la désactivation',
      )
      return false
    }
  }

  return {
    configureEmail,
    resendCode,
    enableEmail,
    disableEmail,
  }
}

export default useEmailTwoFactor
