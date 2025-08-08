import axios from 'axios'
import { toast } from 'sonner'
import {
  startRegistration,
  startAuthentication,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/browser'
import { VITE_2FA_WEB_AUTHN } from '../../utils/env'

interface WebAuthnCredential {
  id: string
  deviceName: string
  deviceType: string
  lastUsed: Date
  createdAt: Date
}

interface RegistrationResponse {
  success: boolean
  options?: any
  error?: string
  message?: string
}

interface VerificationResponse {
  success: boolean
  credentialId?: string
  error?: string
  credentials?: WebAuthnCredential[]
  preferredMethod?: boolean
  backupCodes?: string[]
}

const useWebAuthnTwoFactor = () => {
  /**
   * Récupère les options d'enregistrement depuis le serveur
   */
  const getRegistrationOptions = async (): Promise<RegistrationResponse> => {
    try {
      const { data } = await axios.get(
        `${VITE_2FA_WEB_AUTHN}/generate-registration`,
        { withCredentials: true },
      )

      if (data.success) {
        if (data.options) {
          return {
            success: true,
            options: data.options,
          }
        }
        return {
          success: true,
        }
      }
      return {
        success: false,
        error: data.error || 'Erreur inconnue',
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Erreur lors de la configuration'
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Vérifie la réponse d'enregistrement avec le serveur
   */
  const verifyRegistration = async (
    attestationResponse: any,
  ): Promise<VerificationResponse> => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_WEB_AUTHN}/verify-registration`,
        {
          attestationResponse,
          deviceName: 'Nouvelle clé',
        },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Clé enregistrée avec succès')
        return {
          success: true,
          credentialId: data.credentialId,
          credentials: data.credentials,
          preferredMethod: data.preferredMethod,
          backupCodes: data.backupCodes,
        }
      }
      return {
        success: false,
        error: data.error,
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Erreur lors de la vérification'
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Lance le processus d'enregistrement WebAuthn (Flow complet)
   */
  const registerDevice = async (): Promise<VerificationResponse> => {
    try {
      // 1. Récupérer les options d'enregistrement
      const registrationOptions = await getRegistrationOptions()
      if (!registrationOptions.success) {
        return {
          success: false,
          error: registrationOptions.error,
        }
      } else if (registrationOptions.success && !registrationOptions.options) {
        return {
          success: true,
        }
      }
      console.log("Options d'enregistrement:", registrationOptions.options)

      // 2. Lancer l'enregistrement avec le navigateur
      const attestationResponse: RegistrationResponseJSON =
        await startRegistration(registrationOptions.options)
      console.log("Réponse d'attestation:", attestationResponse)

      // 3. Vérifier l'enregistrement avec le serveur
      const verificationRes = await verifyRegistration(attestationResponse)

      return verificationRes
    } catch (error: any) {
      console.error('Erreur enregistrement WebAuthn:', error)

      // Gestion spécifique des erreurs WebAuthn
      let errorMsg = "Erreur lors de l'enregistrement de la clé de sécurité"
      if (error.name === 'InvalidStateError') {
        errorMsg = 'Cet appareil est déjà enregistré'
      } else if (error.name === 'NotAllowedError') {
        errorMsg = "L'opération a été annulée par l'utilisateur"
      }

      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Met à jour le nom d'un appareil enregistré
   */
  const setCredentialName = async (
    id: string,
    deviceName: string,
  ): Promise<VerificationResponse> => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_WEB_AUTHN}/set-name`,
        { id, deviceName },
        { withCredentials: true },
      )

      if (data.success) {
        toast.success(data.message || 'Nom de la clé mis à jour')
        return {
          success: true,
        }
      }
      return {
        success: false,
        error: data.error,
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Erreur lors de la mise à jour'
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Supprime un appareil enregistré
   */
  const deleteCredential = async (
    id: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data } = await axios.delete(
        `${VITE_2FA_WEB_AUTHN}/credential/${id}`,
        { withCredentials: true },
      )

      if (data.success) {
        toast.success('Clé de sécurité supprimée')
        return { success: true }
      }
      return {
        success: false,
        error: data.error,
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Erreur lors de la suppression'
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Récupère les options d'enregistrement depuis le serveur
   */
  const getAuthenticationOptions = async (
    email: string,
  ): Promise<RegistrationResponse> => {
    try {
      const { data } = await axios.get(
        `${VITE_2FA_WEB_AUTHN}/generate-authentication`,
        { params: { email }, withCredentials: true },
      )

      if (data.success) {
        return {
          success: true,
          options: data.options,
        }
      }
      return {
        success: false,
        error: data.error || 'Erreur inconnue',
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Erreur lors de la configuration'
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Vérifie la réponse d'authentification avec le serveur
   */
  const verifyAuthentication = async (
    assertionResponse: any,
    email: string,
    rememberMe: boolean,
  ): Promise<VerificationResponse> => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_WEB_AUTHN}/verify-authentication`,
        { assertionResponse, email, rememberMe },
        { withCredentials: true },
      )

      if (data.success) {
        return {
          success: true,
        }
      }
      return {
        success: false,
        error: data.error,
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Erreur lors de la vérification'
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  /**
   * Lance le processus d'authentification WebAuthn (Flow complet)
   */
  const authenticate = async (email: string, rememberMe: boolean) => {
    try {
      // 1. Récupérer les options d'authentification
      const authenticationOptions = await getAuthenticationOptions(email)
      if (!authenticationOptions.success || !authenticationOptions.options) {
        return {
          success: false,
          error: authenticationOptions.error,
        }
      }
      console.log("Options d'authentification:", authenticationOptions.options)

      // 2. Lancer l'authentification avec le navigateur
      const attestationResponse: AuthenticationResponseJSON =
        await startAuthentication(authenticationOptions.options)
      console.log("Réponse d'attestation:", attestationResponse)

      // 3. Vérifier l'authentification avec le serveur
      const verificationRes = await verifyAuthentication(
        attestationResponse,
        email,
        rememberMe,
      )
      if (verificationRes.success) {
        return {
          success: true,
        }
      }
    } catch (error: any) {
      console.error('Erreur authentification WebAuthn:', error)

      // Gestion spécifique des erreurs WebAuthn
      let errorMsg = "Erreur lors de l'authentification de la clé de sécurité"
      if (error.name === 'NotAllowedError') {
        errorMsg = "L'opération a été annulée par l'utilisateur"
      }

      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }

  const disableWebAuthn = async (
    email: string,
    method: 'password' | 'webauthn',
    value?: string,
  ) => {
    if (method === 'password') {
      try {
        const { data } = await axios.post(
          `${VITE_2FA_WEB_AUTHN}/disable`,
          { method, value },
          { withCredentials: true },
        )
        if (data.success) {
          toast.success(data.message || 'WebAuthn désactivé')
          return { success: true }
        } else {
          toast.error(data.error || 'Erreur lors de la désactivation')
          return { success: false, error: data.error }
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.error || 'Erreur lors de la désactivation',
        )
        return { success: false }
      }
    } else if (method === 'webauthn') {
      try {
        // 1. Récupérer les options d'authentification
        const authenticationOptions = await getAuthenticationOptions(email)
        if (!authenticationOptions.success || !authenticationOptions.options) {
          return {
            success: false,
            error: authenticationOptions.error,
          }
        }
        console.log(
          "Options d'authentification:",
          authenticationOptions.options,
        )

        // 2. Lancer l'authentification avec le navigateur
        const attestationResponse: AuthenticationResponseJSON =
          await startAuthentication(authenticationOptions.options)
        console.log("Réponse d'attestation:", attestationResponse)

        // 3. Vérifier l'authentification avec le serveur
        const { data } = await axios.post(
          `${VITE_2FA_WEB_AUTHN}/disable`,
          { method, value: attestationResponse },
          { withCredentials: true },
        )
        if (data.success) {
          toast.success(data.message || 'WebAuthn désactivé')
          return {
            success: true,
          }
        } else {
          toast.error(data.error || 'Erreur lors de la désactivation')
          return { success: false, error: data.error }
        }
      } catch (error: any) {
        console.error('Erreur authentification WebAuthn:', error)

        // Gestion spécifique des erreurs WebAuthn
        let errorMsg = "Erreur lors de l'authentification de la clé de sécurité"
        if (error.name === 'NotAllowedError') {
          errorMsg = "L'opération a été annulée par l'utilisateur"
        }

        toast.error(errorMsg)
        return {
          success: false,
          error: errorMsg,
        }
      }
    }
  }

  return {
    registerDevice,
    verifyRegistration,
    setCredentialName,
    deleteCredential,
    authenticate,
    verifyAuthentication,
    disableWebAuthn,
  }
}

export default useWebAuthnTwoFactor
