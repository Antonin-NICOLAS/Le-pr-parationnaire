export const VITE_AUTH =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/auth' : '/api/auth'
export const VITE_USER =
  import.meta.env.VITE_NODE_ENV === 'development' ? '/user' : '/api/user'
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
export const VITE_2FA_WEB_AUTHN =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa/webauthn'
    : '/api/auth/2fa/webauthn'
export const VITE_2FA_QUESTIONS =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa/security-questions'
    : '/api/auth/2fa/security-questions'
