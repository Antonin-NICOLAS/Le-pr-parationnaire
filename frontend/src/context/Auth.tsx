import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../types/auth'
import axios from 'axios'
import { toast } from 'sonner'

import.meta.env.VITE_AUTH =
    import.meta.env.VITE_NODE_ENV === 'development' ? '/auth' : '/api/auth'

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    error: string | null
    checkAuthStatus: (email: string) => Promise<boolean>
    login: (
        email: string,
        password: string,
        rememberMe: boolean
    ) => Promise<void>
    logout: () => Promise<void>
    register: (data: {
        email: string
        password: string
        lastName: string
        firstName: string
        rememberMe?: boolean
    }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const checkAuth = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_AUTH}/profile`,
                {
                    withCredentials: true,
                }
            )
            setIsAuthenticated(true)
            setUser(res.data)
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
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
            setError(
                err.response?.data?.message ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
            setUser(null)
        }
    }

    const login = async (
        email: string,
        password: string,
        rememberMe: boolean
    ) => {
        try {
            setError(null)
            const { data } = await axios.post(
                `${import.meta.env.VITE_AUTH}/login`,
                { email, password, rememberMe },
                { withCredentials: true }
            )
            if (data.success) {
                toast.success('Login successful!')
                await checkAuth()
            }
        } catch (err: any) {
            toast.error(
                err.response?.data?.error ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
            setError(
                err.response?.data?.message ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
            setUser(null)
        }
    }

    const logout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_AUTH}/logout`,
                {},
                { withCredentials: true }
            )
            setUser(null)
        } catch (err: any) {
            toast.error(
                err.response?.data?.error ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
            setError(
                err.response?.data?.message ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
        }
    }

    const register = async (data: {
        email: string
        password: string
        lastName: string
        firstName: string
        rememberMe?: boolean
    }) => {
        try {
            setError(null)
            await axios.post(`${import.meta.env.VITE_AUTH}/register`, data, {
                withCredentials: true,
            })
            await checkAuth()
        } catch (err: any) {
            toast.error(
                err.response?.data?.error ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
            )
            setError(
                err.response?.data?.message ||
                    'Erreur inconnue. Veuillez réessayer plus tard.'
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
                checkAuthStatus,
                login,
                logout,
                register,
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
