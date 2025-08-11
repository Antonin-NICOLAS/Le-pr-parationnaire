import axios from 'axios'
import {
  startRegistration,
  startAuthentication,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/browser'
import { VITE_WEB_AUTHN } from '../../utils/env'

import { useApiCall, type ApiCallConfig } from '../useApiCall'

export function useWebAuthnApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  config: ApiCallConfig = {},
) {
  return useApiCall<T>(async (...args) => {
    try {
      return await apiFunction(...args)
    } catch (error: any) {
      // Interception des erreurs spécifiques WebAuthn
      if (error?.name === 'InvalidStateError') {
        return { success: false, error: 'Cet appareil est déjà enregistré' }
      }
      if (error?.name === 'NotAllowedError') {
        return {
          success: false,
          error: "L'opération a été annulée par l'utilisateur",
        }
      }
      throw error // Laisser useApiCall gérer les autres erreurs
    }
  }, config)
}

const getRegistrationOptionsApi = () =>
  axios.get(`${VITE_WEB_AUTHN}/generate-registration`, {
    withCredentials: true,
  })

const verifyRegistrationApi = (attestationResponse: RegistrationResponseJSON) =>
  axios.post(
    `${VITE_WEB_AUTHN}/verify-registration`,
    { attestationResponse },
    { withCredentials: true },
  )

const setCredentialNameApi = (id: string, deviceName: string) =>
  axios.post(
    `${VITE_WEB_AUTHN}/set-name`,
    { id, deviceName },
    { withCredentials: true },
  )

const deleteCredentialApi = (id: string) =>
  axios.delete(`${VITE_WEB_AUTHN}/credential/${id}`, { withCredentials: true })

const getAuthenticationOptionsApi = (email: string) =>
  axios.get(`${VITE_WEB_AUTHN}/generate-authentication`, {
    params: { email },
    withCredentials: true,
  })

const verifyAuthenticationApi = (
  assertionResponse: AuthenticationResponseJSON,
  email: string,
  rememberMe: boolean,
) =>
  axios.post(
    `${VITE_WEB_AUTHN}/verify-authentication`,
    { assertionResponse, email, rememberMe },
    { withCredentials: true },
  )

const disableWebAuthnApi = (method: 'password' | 'webauthn', value?: any) =>
  axios.post(
    `${VITE_WEB_AUTHN}/disable`,
    { method, value },
    { withCredentials: true },
  )

// ---------------------------
// Hook principal
// ---------------------------
const useWebAuthnTwoFactor = () => {
  // API simples
  const setCredentialName = useApiCall(setCredentialNameApi, {
    successMessage: 'Nom de la clé mis à jour',
    errorMessage: 'Erreur lors de la mise à jour',
  })

  const deleteCredential = useApiCall(deleteCredentialApi, {
    successMessage: 'Clé de sécurité supprimée',
    errorMessage: 'Erreur lors de la suppression',
  })

  // Flows complexes
  const registerDevice = useWebAuthnApiCall(
    async () => {
      // 1. Récupérer options
      const optionsRes = await getRegistrationOptionsApi()
      if (!optionsRes.data?.success || !optionsRes.data?.options) {
        return optionsRes.data
      }

      // 2. Lancer enregistrement navigateur
      const attestationResponse: RegistrationResponseJSON =
        await startRegistration({
          optionsJSON: optionsRes.data.options,
        })

      // 3. Vérifier côté serveur
      const verifyRes = await verifyRegistrationApi(attestationResponse)
      return verifyRes.data
    },
    {
      successMessage: 'Clé enregistrée avec succès',
      errorMessage: "Erreur lors de l'enregistrement de la clé",
    },
  )

  const authenticate = useWebAuthnApiCall(
    async ({ email, rememberMe }: { email: string; rememberMe: boolean }) => {
      // 1. Récupérer options
      const optionsRes = await getAuthenticationOptionsApi(email)
      if (!optionsRes.data?.success || !optionsRes.data?.options) {
        return optionsRes.data
      }

      // 2. Authentification navigateur
      const assertionResponse: AuthenticationResponseJSON =
        await startAuthentication({
          optionsJSON: optionsRes.data.options,
        })

      // 3. Vérifier côté serveur
      const verifyRes = await verifyAuthenticationApi(
        assertionResponse,
        email,
        rememberMe,
      )
      return verifyRes.data
    },
    {
      successMessage: 'Authentification réussie',
      errorMessage: "Erreur lors de l'authentification",
    },
  )

  const disableWebAuthn = useWebAuthnApiCall(
    async ({
      email,
      method,
      password,
    }: {
      email: string
      method: 'password' | 'webauthn'
      password?: string
    }) => {
      if (method === 'password') {
        return (await disableWebAuthnApi('password', password)).data
      } else {
        const optionsRes = await getAuthenticationOptionsApi(email)
        if (!optionsRes.data?.success || !optionsRes.data?.options) {
          return optionsRes.data
        }

        const assertionResponse: AuthenticationResponseJSON =
          await startAuthentication({
            optionsJSON: optionsRes.data.options,
          })

        return (await disableWebAuthnApi('webauthn', assertionResponse)).data
      }
    },
    {
      successMessage: 'WebAuthn désactivé',
      errorMessage: 'Erreur lors de la désactivation',
    },
  )

  return {
    registerDevice: registerDevice.execute,
    registerDeviceState: registerDevice,

    authenticate: authenticate.execute,
    authenticateState: authenticate,

    disableWebAuthn: disableWebAuthn.execute,
    disableWebAuthnState: disableWebAuthn,

    setCredentialName: setCredentialName.execute,
    setCredentialNameState: setCredentialName,

    deleteCredential: deleteCredential.execute,
    deleteCredentialState: deleteCredential,
  }
}

export default useWebAuthnTwoFactor
