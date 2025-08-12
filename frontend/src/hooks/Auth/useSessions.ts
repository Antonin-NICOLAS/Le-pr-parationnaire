import axios from 'axios'

import { VITE_AUTH } from '../../utils/env'
import { useApiCall } from '../useApiCall'
import { useAuth } from '../../context/Auth'

// API functions
const checkActiveSessionsApi = () =>
  axios.get(`${VITE_AUTH}/active-sessions`, { withCredentials: true })

const revokeSessionApi = (sessionId: string) =>
  axios.delete(`${VITE_AUTH}/revoke-session/${sessionId}`, {
    withCredentials: true,
  })

const revokeAllSessionsApi = () =>
  axios.delete(`${VITE_AUTH}/revoke-all-sessions`, {
    withCredentials: true,
  })

const useSessions = () => {
  const { logout } = useAuth()
  const checkActiveSessions = useApiCall(checkActiveSessionsApi, {
    showSuccessToast: false,
    successMessage: 'Sessions actives récupérées',
    errorMessage: 'Erreur lors de la configuration',
  })

  const revokeSession = useApiCall(revokeSessionApi, {
    successMessage: 'Session révoquée avec succès',
    errorMessage: 'Erreur lors de la révocation de la session',
    onSuccess: () => {
      checkActiveSessions.execute()
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
    checkActiveSessions: checkActiveSessions.execute,
    checkActiveSessionsState: checkActiveSessions,
    revokeSession: revokeSession.execute,
    revokeSessionState: revokeSession,
    revokeAllSessions: revokeAllSessions.execute,
    revokeAllSessionsState: revokeAllSessions,
  }
}

export default useSessions
