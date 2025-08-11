import axios from 'axios'

import { VITE_2FA_EMAIL } from '../../utils/env'
import { useApiCall } from '../useApiCall'

// API functions
const configureEmailApi = () =>
  axios.post(`${VITE_2FA_EMAIL}/config`, {}, { withCredentials: true })

const resendCodeApi = (
  email: string,
  context: 'config' | 'disable' | 'login',
) =>
  axios.post(
    `${VITE_2FA_EMAIL}/resend/${context}`,
    { email },
    { withCredentials: true },
  )

const enableEmailApi = (code: string) =>
  axios.post(`${VITE_2FA_EMAIL}/enable`, { code }, { withCredentials: true })

const disableEmailApi = (method: 'otp' | 'password', value: string) =>
  axios.post(
    `${VITE_2FA_EMAIL}/disable`,
    { method, value },
    { withCredentials: true },
  )

const useEmailTwoFactor = () => {
  const configureEmail = useApiCall(configureEmailApi, {
    successMessage: 'Code de vérification envoyé par email',
    errorMessage: 'Erreur lors de la configuration',
  })

  const resendCode = useApiCall(resendCodeApi, {
    successMessage: 'Code de vérification renvoyé par email',
    errorMessage: "Erreur lors de l'envoi du code",
  })

  const enableEmail = useApiCall(enableEmailApi, {
    successMessage: '2FA par email activée avec succès',
    errorMessage: 'Code invalide',
  })

  const disableEmail = useApiCall(disableEmailApi, {
    successMessage: '2FA par email désactivée',
    errorMessage: 'Une erreur est survenue. Veuillez réessayer plus tard.',
  })
  return {
    configureEmail: configureEmail.execute,
    configureEmailState: configureEmail,
    resendCode: resendCode.execute,
    resendCodeState: resendCode,
    enableEmail: enableEmail.execute,
    enableEmailState: enableEmail,
    disableEmail: disableEmail.execute,
    disableEmailState: disableEmail,
  }
}

export default useEmailTwoFactor
