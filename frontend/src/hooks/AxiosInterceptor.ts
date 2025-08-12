import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/Auth'
import { VITE_AUTH } from '../utils/env'
import { toast } from 'sonner'

const AxiosInterceptor = () => {
  const navigate = useNavigate()
  const { resendVerificationEmail, logout } = useAuth()

  useEffect(() => {
    let isRefreshing = false
    let failedQueue: any[] = []

    const processQueue = (error: any) => {
      failedQueue.forEach((prom) => {
        if (error) prom.reject(error)
        else prom.resolve()
      })
      failedQueue = []
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            })
              .then(() => axios(originalRequest))
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            await axios.post(
              `${VITE_AUTH}/refresh`,
              {},
              { withCredentials: true },
            )
            processQueue(null)
            return axios(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError)
            const axiosError = refreshError as import('axios').AxiosError
            const errorMessage =
              axiosError?.response?.data &&
              typeof axiosError.response.data === 'object' &&
              'error' in axiosError.response.data
                ? (axiosError.response.data as { error?: string }).error
                : 'Votre session a expiré. Veuillez vous reconnecter.'
            toast.error(errorMessage)
            await logout()
            await navigate('/auth/login')
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }

        if (error.response?.data?.requiresVerification) {
          await resendVerificationEmail(error.response.data.email)
          navigate('/verify-email', {
            state: {
              email: error.response.data.email ?? '',
              rememberMe: error.response.data.rememberMe ?? false,
            },
          })
        }
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [navigate, logout, resendVerificationEmail])

  return null // Composant qui ne rend rien
}

export default AxiosInterceptor
