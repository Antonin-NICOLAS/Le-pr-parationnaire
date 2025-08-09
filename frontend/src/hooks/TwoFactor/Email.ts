// frontend/hooks/useEmailTwoFactor.ts
import axios from 'axios'
import { toast } from 'sonner'
import { VITE_2FA_EMAIL } from '../../utils/env'
import type {
  TwoFactorEmailConfigResponse,
  TwoFactorEmailEnableResponse,
  TwoFactorEmailDisableResponse,
} from '../../types/api'

const useEmailTwoFactor = () => {
  const configureEmail = async (): Promise<TwoFactorEmailConfigResponse> => {
    try {
      const { data } = await axios.post<TwoFactorEmailConfigResponse>(
        `${VITE_2FA_EMAIL}/config`,
        {},
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Code de vérification envoyé par email')
        return {
          success: true,
          message: data.message,
        }
      }
      return {
        success: false,
        error: data.error || 'Erreur lors de la configuration',
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

  const resendCode = async (
    email: string,
  ): Promise<TwoFactorEmailConfigResponse> => {
    try {
      const { data } = await axios.post<TwoFactorEmailConfigResponse>(
        `${VITE_2FA_EMAIL}/resend`,
        { email },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Code de vérification envoyé par email')
        return {
          success: true,
          message: data.message,
        }
      }
      return {
        success: false,
        error: data.error || "Échec de l'envoi du code",
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

  const enableEmail = async (
    code: string,
  ): Promise<TwoFactorEmailEnableResponse> => {
    try {
      const { data } = await axios.post<TwoFactorEmailEnableResponse>(
        `${VITE_2FA_EMAIL}/enable`,
        { code },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || '2FA par email activée avec succès')
        return {
          success: true,
          message: data.message,
          backupCodes: data.backupCodes,
          preferredMethod: data.preferredMethod,
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

  const disableEmail = async (
    method: 'otp' | 'password',
    value: string,
  ): Promise<TwoFactorEmailDisableResponse> => {
    try {
      const { data } = await axios.post<TwoFactorEmailDisableResponse>(
        `${VITE_2FA_EMAIL}/disable`,
        { method, value },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || '2FA par email désactivée')
        return {
          success: true,
          message: data.message,
          preferredMethod: data.preferredMethod,
          backupCodes: data.backupCodes,
        }
      }
      return {
        success: false,
        error: data.error || 'Échec de la désactivation',
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la désactivation',
      )
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur réseau',
      }
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
