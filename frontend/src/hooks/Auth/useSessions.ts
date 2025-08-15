import axios from 'axios'

import { VITE_SESSION } from '../../utils/env'
import { useApiCall } from '../useApiCall'
import { useAuth } from '../../context/Auth'

// API functions
const getActiveSessionsApi = () =>
  axios.get(`${VITE_SESSION}`, { withCredentials: true })

const revokeSessionApi = (sessionId: string) =>
  axios.delete(`${VITE_SESSION}/revoke/${sessionId}`, {
    withCredentials: true,
  })

const revokeAllSessionsApi = () =>
  axios.delete(`${VITE_SESSION}/revoke-all`, {
    withCredentials: true,
  })

const useSessions = () => {
  const { logout } = useAuth()
  const getActiveSessions = useApiCall(getActiveSessionsApi, {
    showSuccessToast: false,
    successMessage: 'Sessions actives récupérées',
    errorMessage: 'Erreur lors de la configuration',
  })

  const revokeSession = useApiCall(revokeSessionApi, {
    successMessage: 'Session révoquée avec succès',
    errorMessage: 'Erreur lors de la révocation de la session',
    onSuccess: () => {
      getActiveSessions.execute()
    },
  })

  const revokeAllSessions = useApiCall(revokeAllSessionsApi, {
    successMessage: 'Toutes les sessions révoquées avec succès',
    errorMessage: 'Erreur lors de la révocation des sessions',
    onSuccess: async () => {
      await logout()
    },
  })

  return {
    getActiveSessions: getActiveSessions.execute,
    getActiveSessionsState: getActiveSessions,
    revokeSession: revokeSession.execute,
    revokeSessionState: revokeSession,
    revokeAllSessions: revokeAllSessions.execute,
    revokeAllSessionsState: revokeAllSessions,
  }
}

export default useSessions
