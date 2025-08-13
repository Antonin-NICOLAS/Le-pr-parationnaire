import axios from 'axios'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { type ApiResponse, useApiCall } from '../hooks/useApiCall'
import type {
  CheckAuthResponse,
  CheckAuthStatusResponse,
  LoginData,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  EmailVerificationData,
} from '../types/auth'
import type { User } from '../types/user'
import { VITE_AUTH } from '../utils/env'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  checkAuth: () => Promise<ApiResponse>
  checkAuthStatus: (email: string) => Promise<ApiResponse>
  login: (data: LoginData) => Promise<ApiResponse>
  logout: () => Promise<ApiResponse>
  register: (data: RegisterData) => Promise<ApiResponse>
  emailVerification: (data: EmailVerificationData) => Promise<ApiResponse>
  resendVerificationEmail: (email: string) => Promise<ApiResponse>
  checkAuthState: ReturnType<typeof useApiCall<CheckAuthResponse>>
  checkAuthStatusState: ReturnType<typeof useApiCall<CheckAuthStatusResponse>>
  loginState: ReturnType<typeof useApiCall<LoginResponse>>
  logoutState: ReturnType<typeof useApiCall>
  registerState: ReturnType<typeof useApiCall<RegisterResponse>>
  emailVerificationState: ReturnType<typeof useApiCall>
  resendVerificationEmailState: ReturnType<typeof useApiCall>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuthCall = useApiCall<CheckAuthResponse>(
    async () => {
      return axios.get(`${VITE_AUTH}/profile`, { withCredentials: true })
    },
    {
      showSuccessToast: false,
      showErrorToast: false,
      onSuccess: (res) => {
        setIsAuthenticated(true)
        setUser(res.user)
      },
      onError: () => {
        setIsAuthenticated(false)
        setUser(null)
      },
    },
  )

  const checkAuthStatusCall = useApiCall<CheckAuthStatusResponse>(
    async (email: string) => {
      return axios.get(`${VITE_AUTH}/status`, {
        params: { email },
        withCredentials: true,
      })
    },
    { showErrorToast: true, showSuccessToast: false },
  )

  const loginCall = useApiCall<LoginResponse>(
    async (data: LoginData) => {
      return axios.post(`${VITE_AUTH}/login`, data, { withCredentials: true })
    },
    {
      onSuccess: async (res) => {
        if (!res.requiresTwoFactor) {
          await checkAuth()
        }
      },
    },
  )

  const logoutCall = useApiCall(
    async () => {
      return axios.post(`${VITE_AUTH}/logout`, {}, { withCredentials: true })
    },
    {
      onSuccess: () => {
        setUser(null)
        setIsAuthenticated(false)
      },
    },
  )

  const registerCall = useApiCall<RegisterResponse>(
    async (data: RegisterData) => {
      return axios.post(`${VITE_AUTH}/register`, data, {
        withCredentials: true,
      })
    },
  )

  const emailVerificationCall = useApiCall(
    async (data: EmailVerificationData) => {
      return axios.post(`${VITE_AUTH}/verify-email`, data, {
        withCredentials: true,
      })
    },
    {
      onSuccess: async () => {
        await checkAuth()
      },
    },
  )

  const resendVerificationEmailCall = useApiCall(async (email: string) => {
    return axios.post(
      `${VITE_AUTH}/resend-verification-email`,
      { email },
      { withCredentials: true },
    )
  })

  /** ---------------------------
   * --------------------------- */

  const checkAuth = useCallback(() => checkAuthCall.execute(), [checkAuthCall])
  const checkAuthStatus = useCallback(
    (email: string) => checkAuthStatusCall.execute(email),
    [checkAuthStatusCall],
  )
  const login = useCallback(
    (data: LoginData) => loginCall.execute(data),
    [loginCall],
  )
  const logout = useCallback(() => logoutCall.execute(), [logoutCall])
  const register = useCallback(
    (data: RegisterData) => registerCall.execute(data),
    [registerCall],
  )
  const emailVerification = useCallback(
    (data: EmailVerificationData) => emailVerificationCall.execute(data),
    [emailVerificationCall],
  )
  const resendVerificationEmail = useCallback(
    (email: string) => resendVerificationEmailCall.execute(email),
    [resendVerificationEmailCall],
  )

  /** ---------------------------
   *  Initialisation
   * --------------------------- */
  useEffect(() => {
    checkAuth()
  }, [])

  const globalLoading =
    checkAuthCall.loading || loginCall.loading || logoutCall.loading

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading: globalLoading,
        checkAuth,
        checkAuthStatus,
        login,
        logout,
        register,
        emailVerification,
        resendVerificationEmail,

        checkAuthState: checkAuthCall,
        checkAuthStatusState: checkAuthStatusCall,
        loginState: loginCall,
        logoutState: logoutCall,
        registerState: registerCall,
        emailVerificationState: emailVerificationCall,
        resendVerificationEmailState: resendVerificationEmailCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return context
}
