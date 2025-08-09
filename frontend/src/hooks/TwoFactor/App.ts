import axios from 'axios'
import { toast } from 'sonner'
import { VITE_2FA_APP } from '../../utils/env'
import type {
  TwoFactorAppConfigResponse,
  TwoFactorAppEnableResponse,
  TwoFactorAppDisableResponse,
} from '../../types/api'

const useAppTwoFactor = () => {
  const configureApp = async (): Promise<TwoFactorAppConfigResponse> => {
    try {
      const { data } = await axios.post<TwoFactorAppConfigResponse>(
        `${VITE_2FA_APP}/config`,
        {},
        { withCredentials: true },
      )

      if (data.success) {
        return {
          success: true,
          secret: data.secret!,
          qrCode: data.qrCode!,
        }
      }
      return {
        success: false,
        error: data.error || 'Erreur inconnue lors de la configuration',
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la configuration',
      )
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur réseau',
      }
    }
  }

  const enableApp = async (
    token: string,
  ): Promise<TwoFactorAppEnableResponse> => {
    try {
      const { data } = await axios.post<TwoFactorAppEnableResponse>(
        `${VITE_2FA_APP}/enable`,
        { token },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || '2FA par application activée avec succès')
        return {
          success: true,
          backupCodes: data.backupCodes!,
          preferredMethod: data.preferredMethod!,
        }
      }
      return {
        success: false,
        error: data.error || "Échec de l'activation",
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Code invalide')
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur réseau',
      }
    }
  }

  const disableApp = async (
    code: string,
    password?: string,
  ): Promise<TwoFactorAppDisableResponse> => {
    try {
      const { data } = await axios.post<TwoFactorAppDisableResponse>(
        `${VITE_2FA_APP}/disable`,
        { code, password },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || '2FA par application désactivée')
        return data
      }
      return {
        success: false,
        error: data.error || 'Échec de la désactivation',
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Code ou mot de passe invalide',
      )
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur réseau',
      }
    }
  }

  return {
    configureApp,
    enableApp,
    disableApp,
  }
}

export default useAppTwoFactor
