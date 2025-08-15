// USER
export const VITE_USER =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/user' : '/api/user'

// AUTHENTICATION
export const VITE_AUTH =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/auth' : '/api/auth'

// AUTHENTICATION - FORGOT PASSWORD
export const VITE_FORGOT_PASSWORD =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/forgot-password'
    : '/api/auth/forgot-password'

// AUTHENTICATION - 2FA
export const VITE_2FA =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa'
    : '/api/auth/2fa'
export const VITE_2FA_APP =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa/app'
    : '/api/auth/2fa/app'
export const VITE_2FA_EMAIL =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa/email'
    : '/api/auth/2fa/email'
export const VITE_WEB_AUTHN =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/webauthn'
    : '/api/auth/webauthn'
export const VITE_2FA_QUESTIONS =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa/security-questions'
    : '/api/auth/2fa/security-questions'

// SESSIONS
export const VITE_SESSION =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/session' : '/api/session'
