import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

import.meta.env.VITE_AUTH =
    import.meta.env.VITE_NODE_ENV === 'development' ? '/auth' : '/api/auth'

export interface User {
    id: string
    nom: string
    prenom: string
    avatarUrl?: string
    email: string
    lastLogin?: Date
    loginHistory?: Array<{
        ip: string
        userAgent: string
        location: string
        date: Date
    }>
    TwoFactor?: {
        email: boolean
        app: boolean
        webauthn: boolean
    }
    role: string
    language: string
    theme: string
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    error: string | null
    login: (
        email: string,
        password: string,
        rememberMe: boolean
    ) => Promise<void>
    logout: () => Promise<void>
    register: (data: {
        email: string
        password: string
        nom: string
        prenom: string
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

    const login = async (
        email: string,
        password: string,
        rememberMe: boolean
    ) => {
        try {
            setError(null)
            await axios.post(
                `${import.meta.env.VITE_AUTH}/login`,
                { email, password, rememberMe },
                { withCredentials: true }
            )
            await checkAuth()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur de connexion')
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
        } catch (err) {
            console.error(err)
        }
    }

    const register = async (data: {
        email: string
        password: string
        nom: string
        prenom: string
        rememberMe?: boolean
    }) => {
        try {
            setError(null)
            await axios.post(`${import.meta.env.VITE_AUTH}/register`, data, {
                withCredentials: true,
            })
            await checkAuth()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur à l’inscription')
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, error, login, logout, register }}
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
