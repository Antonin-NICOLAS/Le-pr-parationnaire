import axios from 'axios'
import { toast } from 'sonner'
import { VITE_2FA_EMAIL } from '../../utils/env'

const useEmailTwoFactor = () => {
  const configureEmail = async () => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_EMAIL}/config`,
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

  const resendCode = async (email: string) => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_EMAIL}/resend`,
        { email },
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
        `${VITE_2FA_EMAIL}/enable`,
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
        `${VITE_2FA_EMAIL}/disable`,
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
