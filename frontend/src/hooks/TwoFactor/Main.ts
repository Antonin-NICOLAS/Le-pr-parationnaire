import axios from 'axios'

import { VITE_2FA } from '../../utils/env'
import { useApiCall } from '../useApiCall'

// API functions
const getTwoFactorStatusApi = () =>
  axios.get(`${VITE_2FA}/status`, { withCredentials: true })

const setPreferredMethodApi = (method: 'email' | 'app' | 'webauthn') =>
  axios.post(
    `${VITE_2FA}/set-preferred-method`,
    { method },
    { withCredentials: true },
  )

const twoFactorLoginApi = (
  email: string,
  rememberMe: boolean,
  method: string,
  value: string,
) =>
  axios.post(
    `${VITE_2FA}/login`,
    { email, rememberMe, method, value },
    { withCredentials: true },
  )

const useTwoFactorAuth = () => {
  const getTwoFactorStatus = useApiCall(getTwoFactorStatusApi, {
    showSuccessToast: false,
    errorMessage:
      'Erreur lors de la récupération du statut de la double authentification',
  })

  const setPreferredMethod = useApiCall(setPreferredMethodApi, {
    successMessage: 'Méthode préférée mise à jour avec succès',
    errorMessage: 'Erreur lors de la mise à jour de la méthode préférée',
  })

  const twoFactorLogin = useApiCall(twoFactorLoginApi, {
    successMessage: 'Connexion réussie',
    errorMessage: 'Échec de la connexion',
  })

  return {
    getTwoFactorStatus: getTwoFactorStatus.execute,
    getTwoFactorStatusState: getTwoFactorStatus,
    setPreferredMethod: setPreferredMethod.execute,
    setPreferredMethodState: setPreferredMethod,
    twoFactorLogin: twoFactorLogin.execute,
    twoFactorLoginState: twoFactorLogin,
  }
}

export default useTwoFactorAuth
