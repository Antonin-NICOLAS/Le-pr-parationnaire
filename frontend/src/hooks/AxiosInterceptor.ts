import axios from 'axios'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { VITE_AUTH } from '../utils/env'
import { toast } from 'sonner'

const AxiosInterceptor = () => {
  const navigate = useNavigate()
  const { resendVerificationEmail, logout } = useAuth()

  // Utilisation de useRef pour les variables partagées entre les instances
  const refreshState = useRef({
    isRefreshing: false,
    failedQueue: [] as Array<{
      resolve: (value: any) => void
      reject: (reason?: any) => void
    }>,
    logoutPromise: null as Promise<void> | null,
  })

  useEffect(() => {
    const processQueue = (error: any) => {
      refreshState.current.failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error)
        } else {
          prom.resolve(undefined)
        }
      })
      refreshState.current.failedQueue = []
    }

    const handleLogout = async () => {
      if (!refreshState.current.logoutPromise) {
        refreshState.current.logoutPromise = logout()
          .then(() => {
            navigate('/auth/login')
          })
          .finally(() => {
            refreshState.current.logoutPromise = null
          })
      }
      return refreshState.current.logoutPromise
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Gestion de la vérification email
        if (error.response?.data?.requiresVerification) {
          await resendVerificationEmail(error.response.data.email)
          navigate('/verify-email', {
            state: {
              email: error.response.data.email ?? '',
              rememberMe: error.response.data.rememberMe ?? false,
            },
          })
          return Promise.reject(error)
        }

        // Gestion des erreurs 401
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (refreshState.current.isRefreshing) {
            return new Promise((resolve, reject) => {
              refreshState.current.failedQueue.push({ resolve, reject })
            })
              .then(() => {
                originalRequest._retry = true
                return axios(originalRequest)
              })
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          refreshState.current.isRefreshing = true

          try {
            const { data } = await axios.post(
              `${VITE_AUTH}/refresh`,
              {},
              {
                withCredentials: true,
                timeout: 5000, // Timeout de 5 secondes
              },
            )

            // Mettre à jour le header pour les requêtes suivantes
            axios.defaults.headers.common['Authorization'] =
              `Bearer ${data.accessToken}`
            processQueue(null)
            return axios(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError)

            // Gestion spécifique des erreurs
            if (axios.isAxiosError(refreshError)) {
              if (refreshError.response?.status === 429) {
                toast.error('Trop de tentatives. Veuillez réessayer plus tard.')
              } else {
                toast.error('Session expirée. Veuillez vous reconnecter.')
              }
            }

            // Logout unique même pour plusieurs erreurs
            await handleLogout()
            return Promise.reject(refreshError)
          } finally {
            refreshState.current.isRefreshing = false
          }
        }

        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [navigate, logout, resendVerificationEmail])

  return null
}

export default AxiosInterceptor
