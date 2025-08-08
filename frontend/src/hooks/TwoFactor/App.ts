import axios from 'axios'
import { toast } from 'sonner'
import { VITE_2FA_APP } from '../../utils/env'

const useAppTwoFactor = () => {
  const configureApp = async () => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_APP}/config`,
        {},
        { withCredentials: true },
      )
      if (data.success) {
        return {
          success: true,
          secret: data.secret,
          qrCode: data.qrCode,
        }
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la configuration',
      )
      return { success: false }
    }
  }

  const enableApp = async (token: string) => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_APP}/enable`,
        { token },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || '2FA par application activée avec succès')
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

  const disableApp = async (code: string, password?: string) => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_APP}/disable`,
        { code, password },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || '2FA par application désactivée')
        return true
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Code ou mot de passe invalide',
      )
      return false
    }
  }

  return {
    configureApp,
    enableApp,
    disableApp,
  }
}

export default useAppTwoFactor
