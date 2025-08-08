import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, LoginData, RegisterData } from '../types/auth'
import axios from 'axios'
import { toast } from 'sonner'

import.meta.env.VITE_AUTH =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/auth' : '/api/auth'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  error: string | null
  checkAuth: () => Promise<void>
  checkAuthStatus: (email: string) => Promise<boolean>
  login: (LoginData: LoginData) => Promise<{ success: boolean }>
  logout: (onSuccess?: () => void) => Promise<void>
  register: (data: RegisterData, onSuccess?: () => void) => Promise<void>
  emailVerification: (
    token: string,
    email: string,
    rememberMe: boolean,
    onSuccess?: () => void,
  ) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
  checkActiveSessions: () => Promise<Session[]>
  revokeSession: (sessionId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_AUTH}/profile`, {
        withCredentials: true,
      })
      if (data.success) {
        setIsAuthenticated(true)
        setUser(data.user)
      }
    } catch (err) {
      setUser(null)
    }
  }

  const checkAuthStatus = async (email: string) => {
    try {
      setError(null)
      const res = await axios.get(`${import.meta.env.VITE_AUTH}/status`, {
        params: { email },
        withCredentials: true,
      })
      return res.data.webauthn
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setUser(null)
    }
  }

  const login = async (LoginData: LoginData) => {
    try {
      setError(null)
      const { data } = await axios.post(
        `${import.meta.env.VITE_AUTH}/login`,
        LoginData,
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || 'Login successful!')
        await checkAuth()
        return { success: true }
      } else {
        return { success: false }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setUser(null)
      return { success: false }
    }
  }

  const logout = async (onSuccess?: () => void) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_AUTH}/logout`,
        {},
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || 'Logout successful!')
        setUser(null)
        onSuccess?.()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const register = async (
    registerData: RegisterData,
    onSuccess?: () => void,
  ) => {
    try {
      setError(null)
      const { data } = await axios.post(
        `${import.meta.env.VITE_AUTH}/register`,
        registerData,
        {
          withCredentials: true,
        },
      )
      if (data.success) {
        toast.success(data.message || 'Registration successful!')
        onSuccess?.()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const emailVerification = async (
    token: string,
    email: string,
    rememberMe: boolean,
    onSuccess?: () => void,
  ) => {
    try {
      setError(null)
      const { data } = await axios.post(
        `${import.meta.env.VITE_AUTH}/verify-email`,
        { token, email, rememberMe },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || 'Email verified successfully!')
        onSuccess?.()
        await checkAuth()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      setError(null)
      const { data } = await axios.post(
        `${import.meta.env.VITE_AUTH}/resend-verification-email`,
        { email },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success(data.message || 'Verification email resent successfully!')
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  const checkActiveSessions = async () => {
    try {
      setError(null)
      const { data } = await axios.get(
        `${import.meta.env.VITE_AUTH}/active-sessions`,
        {
          withCredentials: true,
        },
      )
      if (data.success) {
        return data.sessions
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      return []
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      setError(null)
      const { data } = await axios.delete(
        `${import.meta.env.VITE_AUTH}/revoke-session/${sessionId}`,
        {
          withCredentials: true,
        },
      )
      if (data.success) {
        toast.success(data.message || 'Session revoked successfully!')
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
      setError(
        err.response?.data?.message ||
          'Erreur inconnue. Veuillez réessayer plus tard.',
      )
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        error,
        checkAuth,
        checkAuthStatus,
        login,
        logout,
        register,
        emailVerification,
        resendVerificationEmail,
        checkActiveSessions,
        revokeSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour accéder facilement au contexte
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
