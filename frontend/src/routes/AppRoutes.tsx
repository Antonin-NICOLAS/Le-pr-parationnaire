import { Routes, Route, Navigate } from 'react-router-dom'
import SidebarLayout from '../layouts/SidebarLayout'
import Home from '../pages/Home'
import SettingsPage from '../pages/Settings'

// authentification routes
import AuthPage from '../pages/auth/AuthPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import LoginStepsPage from '../pages/auth/LoginStepsPage'
import TwoFactorVerifyPage from '../pages/auth/TwoFactorVerifyPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

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
      <Route path='/login-steps' element={<LoginStepsPage />} />
      <Route path='/2fa-verify' element={<TwoFactorVerifyPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
    </Routes>
  )
}
