import axios from 'axios'
import { toast } from 'sonner'

import.meta.env.VITE_2FA =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa'
    : '/api/auth/2fa'

const useTwoFactorAuth = () => {
  const getTwoFactorStatus = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_2FA}/status`, {
        withCredentials: true,
      })
      if (data.success) {
        return {
          success: true,
          email: data.email,
          webauthn: data.webauthn,
          app: data.app,
          preferredMethod: data.preferredMethod,
          backupCodes: data.backupCodes,
          credentials: data.credentials,
        }
      } else {
        return { success: false }
      }
    } catch (error) {
      toast.error(
        'Erreur lors de la récupération du statut de la double authentification',
      )
      return { success: false }
    }
  }

  const setPreferredMethod = async (method: 'email' | 'app' | 'webauthn') => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/set-preferred-method`,
        {
          method,
        },
        {
          withCredentials: true,
        },
      )
      if (data.success) {
        toast.success('Méthode préférée mise à jour avec succès')
        return true
      } else {
        toast.error('Échec de la mise à jour de la méthode préférée')
        return false
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la méthode préférée')
      return false
    }
  }

  return {
    getTwoFactorStatus,
    setPreferredMethod,
  }
}

export default useTwoFactorAuth
