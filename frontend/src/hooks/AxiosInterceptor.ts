import { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth'

const AxiosInterceptor = () => {
  const navigate = useNavigate()
  const { resendVerificationEmail } = useAuth()

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const res = error.response?.data
        if (res?.requiresVerification) {
          await resendVerificationEmail(res.email)
          navigate('/verify-email', {
            state: {
              email: res?.email ?? '',
              rememberMe: res?.rememberMe ?? false,
            },
          })
        }
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [navigate])

  return null // ce composant ne rend rien
}

export default AxiosInterceptor
