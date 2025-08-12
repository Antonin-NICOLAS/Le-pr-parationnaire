import { Navigate, Route, Routes } from 'react-router-dom'

import SidebarLayout from '../layouts/SidebarLayout'
import Home from '../pages/Home'
import SettingsPage from '../pages/Settings'
// authentification routes
import AuthPage from '../pages/auth/AuthPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import TwoFactorVerifyPage from '../pages/auth/TwoFactorVerifyPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<SidebarLayout />}>
        <Route path='/home' element={<Home />} />
        <Route
          path='/settings'
          element={<Navigate to='/settings/security' replace />}
        />
        <Route path='/settings/:tab?' element={<SettingsPage />} />
      </Route>

      {/* Authentication routes */}
      <Route path='/auth' element={<Navigate to='/auth/login' replace />} />
      <Route path='/auth/:tab?' element={<AuthPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route
        path='/2fa-verify'
        element={<Navigate to='/2fa-verify/backup_code' replace />}
      />
      <Route path='/2fa-verify/:method?' element={<TwoFactorVerifyPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
    </Routes>
  )
}
