import axios from 'axios'

import { VITE_2FA_APP } from '../../utils/env'
import { useApiCall } from '../useApiCall'

// API functions
const configureAppApi = () =>
  axios.post(`${VITE_2FA_APP}/config`, {}, { withCredentials: true })

const enableAppApi = (code: string) =>
  axios.post(`${VITE_2FA_APP}/enable`, { code }, { withCredentials: true })

const disableAppApi = (method: 'otp' | 'password', value: string) =>
  axios.post(
    `${VITE_2FA_APP}/disable`,
    { method, value },
    { withCredentials: true },
  )

const useAppTwoFactor = () => {
  const configureApp = useApiCall(configureAppApi, {
    showSuccessToast: false,
    errorMessage: 'Erreur lors de la configuration',
  })

  const enableApp = useApiCall(enableAppApi, {
    successMessage: '2FA par application activée avec succès',
    errorMessage: 'Code invalide',
  })

  const disableApp = useApiCall(disableAppApi, {
    successMessage: '2FA par application désactivée',
    errorMessage: 'Code ou mot de passe invalide',
  })

  return {
    configureApp: configureApp.execute,
    configureAppState: configureApp,
    enableApp: enableApp.execute,
    enableAppState: enableApp,
    disableApp: disableApp.execute,
    disableAppState: disableApp,
  }
}

export default useAppTwoFactor
