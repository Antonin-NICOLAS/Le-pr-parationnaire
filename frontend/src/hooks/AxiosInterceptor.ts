import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { VITE_AUTH } from '../utils/env'

const AxiosInterceptor = () => {
  const navigate = useNavigate()
  const { resendVerificationEmail, logout } = useAuth()
  let isRefreshing = false
  let failedQueue: any[] = []

  const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error)
      else prom.resolve()
    })
    failedQueue = []
  }

  axios.interceptors.response.use(
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
          // Tenter de rafraîchir le token
          await axios.post(
            `${VITE_AUTH}/refresh`,
            {},
            { withCredentials: true },
          )
          processQueue(null)
          return axios(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError)
          await logout()
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
}

export default AxiosInterceptor
