import axios from 'axios'

import { VITE_FORGOT_PASSWORD } from '../../utils/env'
import { useApiCall } from '../useApiCall'

// API functions
const forgotPasswordApi = (email: string) =>
  axios.post(
    `${VITE_FORGOT_PASSWORD}/send`,
    { email },
    { withCredentials: true },
  )

const verifyResetTokenApi = (token: string) =>
  axios.post(
    `${VITE_FORGOT_PASSWORD}/verify`,
    { token },
    { withCredentials: true },
  )

const resetPasswordApi = (
  email: string,
  token: string,
  newPassword: string,
  confirmPassword: string,
) =>
  axios.post(
    `${VITE_FORGOT_PASSWORD}/reset`,
    { email, token, newPassword, confirmPassword },
    { withCredentials: true },
  )

const useForgotPassword = () => {
  const forgotPassword = useApiCall(forgotPasswordApi, {
    errorMessage: "Erreur lors de l'envoi du courriel de réinitialisation.",
    showErrorToast: true,
    showSuccessToast: false,
  })

  const verifyResetToken = useApiCall(verifyResetTokenApi, {
    successMessage: 'Le token de réinitialisation est valide.',
    showErrorToast: false,
    showSuccessToast: true,
  })

  const resetPassword = useApiCall(resetPasswordApi, {
    successMessage: 'Votre mot de passe a été réinitialisé.',
    showSuccessToast: true,
    showErrorToast: false,
  })

  return {
    forgotPassword: forgotPassword.execute,
    forgotPasswordState: forgotPassword,
    verifyResetToken: verifyResetToken.execute,
    verifyResetTokenState: verifyResetToken,
    resetPassword: resetPassword.execute,
    resetPasswordState: resetPassword,
  }
}

export default useForgotPassword
