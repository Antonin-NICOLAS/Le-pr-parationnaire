import axios from 'axios'

import { VITE_AUTH } from '../../utils/env'
import { useApiCall } from '../useApiCall'

// API functions
const forgotPasswordApi = (email: string) =>
  axios.post(
    `${VITE_AUTH}/forgot-password`,
    { email },
    { withCredentials: true },
  )

const resendForgotPasswordApi = (email: string) =>
  axios.post(
    `${VITE_AUTH}/resend-forgot-password`,
    { email },
    { withCredentials: true },
  )

const verifyTokenApi = (token: string) =>
  axios.post(`${VITE_AUTH}/verify-token`, { token }, { withCredentials: true })

const resetPasswordApi = (email: string, token: string, newPassword: string) =>
  axios.post(
    `${VITE_AUTH}/reset-password`,
    { email, token, newPassword },
    { withCredentials: true },
  )

const useForgotPassword = () => {
  const forgotPassword = useApiCall(forgotPasswordApi, {
    showSuccessToast: false,
    successMessage:
      "Si elle est enregistrée, un courriel de réinitialisation a été envoyé à l'adresse mail fournie.",
    errorMessage: "Erreur lors de l'envoi du courriel de réinitialisation.",
  })

  const resendForgotPassword = useApiCall(resendForgotPasswordApi, {
    successMessage:
      "Si elle est enregistrée, un courriel de réinitialisation a été envoyé à l'adresse mail fournie.",
    errorMessage: "Erreur lors de l'envoi du courriel de réinitialisation.",
  })

  const verifyToken = useApiCall(verifyTokenApi, {
    successMessage: 'Le token de réinitialisation est valide.',
    errorMessage:
      'Erreur lors de la vérification du token de réinitialisation.',
  })

  const resetPassword = useApiCall(resetPasswordApi, {
    successMessage: 'Votre mot de passe a été réinitialisé.',
    errorMessage: 'Erreur lors de la réinitialisation du mot de passe.',
  })

  return {
    forgotPassword: forgotPassword.execute,
    forgotPasswordState: forgotPassword,
    resendForgotPassword: resendForgotPassword.execute,
    resendForgotPasswordState: resendForgotPassword,
    verifyToken: verifyToken.execute,
    verifyTokenState: verifyToken,
    resetPassword: resetPassword.execute,
    resetPasswordState: resetPassword,
  }
}

export default useForgotPassword
