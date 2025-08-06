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
        return data.twoFactor
      }
    } catch (error) {
      toast.error(
        'Erreur lors de la récupération du statut de la double authentification',
      )
      return null
    }
  }

  return {
    getTwoFactorStatus,
  }
}

export default useTwoFactorAuth
