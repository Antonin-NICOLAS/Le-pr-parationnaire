import { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AxiosInterceptor = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const res = error.response?.data
        if (res?.requiresVerification) {
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
