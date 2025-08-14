import {
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser'
import axios from 'axios'

import { useAuth } from '../../context/Auth'
import { VITE_WEB_AUTHN, VITE_2FA } from '../../utils/env'
import { type ApiCallConfig, useApiCall } from '../useApiCall'

export function useWebAuthnApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  config: ApiCallConfig = {},
) {
  return useApiCall<T>(async (...args) => {
    try {
      return await apiFunction(...args)
    } catch (error: any) {
      if (error?.name === 'InvalidStateError') {
        return { success: false, error: 'Cet appareil est déjà enregistré' }
      }
      if (error?.name === 'NotAllowedError') {
        return {
          success: false,
          error: "L'opération a été annulée par l'utilisateur",
        }
      }
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error:
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Erreur réseau',
        }
      }

      return { success: false, error: error.message || 'Erreur inconnue' }
    }
  }, config)
}

const setCredentialNameApi = (
  context: 'primary' | 'secondary',
  id: string,
  deviceName: string,
) =>
  axios.post(
    `${VITE_WEB_AUTHN}/set-name`,
    { id, deviceName },
    {
      params: { context },
      withCredentials: true,
    },
  )

const deleteCredentialApi = (context: 'primary' | 'secondary', id: string) =>
  axios.delete(`${VITE_WEB_AUTHN}/credential/${id}`, {
    params: { context },
    withCredentials: true,
  })

const transferCredentialsApi = (
  fromContext: 'primary' | 'secondary',
  toContext: 'primary' | 'secondary',
  credentialIds: string[],
) =>
  axios.post(
    `${VITE_WEB_AUTHN}/transfer`,
    { fromContext, toContext, credentialIds },
    { withCredentials: true },
  )

const getRegistrationOptionsApi = (context: 'primary' | 'secondary') =>
  axios.get(`${VITE_WEB_AUTHN}/generate-registration`, {
    params: { context },
    withCredentials: true,
  })

const verifyRegistrationApi = (
  context: 'primary' | 'secondary',
  attestationResponse: RegistrationResponseJSON,
) =>
  axios.post(
    `${VITE_WEB_AUTHN}/verify-registration`,
    { attestationResponse },
    { params: { context }, withCredentials: true },
  )

const getAuthenticationOptionsApi = (
  context: 'primary' | 'secondary',
  email: string,
) =>
  axios.get(`${VITE_WEB_AUTHN}/generate-authentication`, {
    params: { email, context },
    withCredentials: true,
  })

const verifyAuthenticationApi = (
  context: 'primary' | 'secondary',
  assertionResponse: AuthenticationResponseJSON,
  email: string,
  rememberMe: boolean,
) =>
  axios.post(
    `${VITE_WEB_AUTHN}/verify-authentication`,
    { assertionResponse, email, rememberMe },
    { params: { context }, withCredentials: true },
  )

const disableWebAuthnApi = (
  context: 'primary' | 'secondary',
  method: 'password' | 'webauthn',
  value?: any,
) =>
  axios.post(
    `${VITE_WEB_AUTHN}/disable`,
    { method, value },
    { params: { context }, withCredentials: true },
  )

const disableTwoFactorApi = (
  method: 'password' | 'email' | 'app' | 'webauthn' | 'backup_code',
  value: any,
) =>
  axios.post(
    `${VITE_2FA}/disable`,
    { method, value },
    { withCredentials: true },
  )

// ---------------------------
// Hook principal
// ---------------------------
const useWebAuthnTwoFactor = () => {
  const { checkAuth } = useAuth()
  // API simples
  const setCredentialName = useApiCall(setCredentialNameApi, {
    successMessage: 'Nom de la clé mis à jour',
    errorMessage: 'Erreur lors de la mise à jour',
  })

  const deleteCredential = useApiCall(deleteCredentialApi, {
    successMessage: 'Clé de sécurité supprimée',
    errorMessage: 'Erreur lors de la suppression',
  })

  const transferCredentials = useApiCall(transferCredentialsApi, {
    successMessage: 'Clé transférée avec succès',
    errorMessage: 'Erreur lors du transfert',
  })

  // Flows complexes
  const registerDevice = useWebAuthnApiCall(
    async (context: 'primary' | 'secondary') => {
      // 1. Récupérer options
      const optionsRes = await getRegistrationOptionsApi(context)
      if (!optionsRes.data?.success || !optionsRes.data?.options) {
        return optionsRes.data
      }

      // 2. Lancer enregistrement navigateur
      const attestationResponse: RegistrationResponseJSON =
        await startRegistration({
          optionsJSON: optionsRes.data.options,
        })

      // 3. Vérifier côté serveur
      const verifyRes = await verifyRegistrationApi(
        context,
        attestationResponse,
      )
      return verifyRes.data
    },
    {
      successMessage: 'Clé enregistrée avec succès',
      errorMessage: "Erreur lors de l'enregistrement de la clé",
    },
  )

  const authenticate = useWebAuthnApiCall(
    async (
      context: 'primary' | 'secondary',
      email: string,
      rememberMe: boolean,
    ) => {
      // 1. Récupérer options
      const optionsRes = await getAuthenticationOptionsApi(context, email)
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
        context,
        assertionResponse,
        email,
        rememberMe,
      )
      return verifyRes.data
    },
    {
      successMessage: 'Authentification réussie',
      errorMessage: "Erreur lors de l'authentification",
      onSuccess: async () => {
        await checkAuth()
      },
    },
  )

  const disableWebAuthn = useWebAuthnApiCall(
    async (
      context: 'primary' | 'secondary',
      email: string,
      method: 'password' | 'webauthn',
      password?: string,
    ) => {
      if (method === 'password') {
        return (await disableWebAuthnApi(context, 'password', password)).data
      } else {
        const optionsRes = await getAuthenticationOptionsApi(context, email)
        if (!optionsRes.data?.success || !optionsRes.data?.options) {
          return optionsRes.data
        }

        const assertionResponse: AuthenticationResponseJSON =
          await startAuthentication({
            optionsJSON: optionsRes.data.options,
          })

        return (
          await disableWebAuthnApi(context, 'webauthn', assertionResponse)
        ).data
      }
    },
    {
      successMessage: 'WebAuthn désactivé',
      errorMessage: 'Erreur lors de la désactivation',
    },
  )

  const disableTwoFactor = useWebAuthnApiCall(
    async (
      email: string,
      method: 'password' | 'email' | 'app' | 'webauthn' | 'backup_code',
      value: string,
    ) => {
      if (method !== 'webauthn') {
        return (await disableTwoFactorApi(method, value)).data
      } else {
        const optionsRes = await getAuthenticationOptionsApi('secondary', email)
        if (!optionsRes.data?.success || !optionsRes.data?.options) {
          return optionsRes.data
        }

        const assertionResponse: AuthenticationResponseJSON =
          await startAuthentication({
            optionsJSON: optionsRes.data.options,
          })

        return (await disableTwoFactorApi('webauthn', assertionResponse)).data
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

    transferCredentials: transferCredentials.execute,
    transferCredentialsState: transferCredentials,

    disableTwoFactor: disableTwoFactor.execute,
    disableTwoFactorState: disableTwoFactor,
  }
}

export default useWebAuthnTwoFactor
