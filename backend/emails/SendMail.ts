import nodemailer from 'nodemailer'
import LogIn from './templates/LogIn.js'
import EmailVerification from './templates/EmailVerification.js'
import ResetPassword from './templates/ResetPassword.js'
import ChangeEmailStep1 from './templates/ChangeEmailStep1.js'
import ChangeEmailStep2 from './templates/ChangeEmailStep2.js'
import EmailTwoFactorLogin from './templates/EmailTwoFactorLogin.js'
import EmailTwoFactorActivation from './templates/EmailTwoFactorActivation.js'
import EmailTwoFactorDeactivation from './templates/EmailTwoFactorDeactivation.js'
// Types
import type { TFunction } from 'i18next'
import type { LeanUser } from '../models/User.js'

// .env
import dotenv from 'dotenv'
import e from 'express'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: String(process.env.NODEMAILER_SERVICE),
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: true,
  auth: {
    type: 'login',
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
} as nodemailer.TransportOptions)

export const sendLoginEmail = async (
  t: TFunction,
  user: LeanUser,
  ipAddress: string,
  deviceInfo: string,
  location: string,
) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const loginDate = new Date().toLocaleDateString(user.language, options)

  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:login.subject'),
    html: LogIn(t, user, loginDate, deviceInfo, ipAddress, location),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw error
  }
}

export const sendVerificationEmail = async (
  t: TFunction,
  user: LeanUser,
  verificationCode: string,
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:emailverification.subject'),
    html: EmailVerification(t, user, verificationCode),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw error
  }
}

export const sendWelcomeEmail = async (
  t: TFunction,
  email: string,
  prenom: string,
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: t('emails:welcome.subject'),
    html: '',
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw error
  }
}

export const sendResetPasswordEmail = async (
  t: TFunction,
  user: LeanUser,
  resetUrl: string,
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:passwordreset.subject'),
    html: ResetPassword(t, user, resetUrl),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw error
  }
}

export const sendResetPasswordSuccessfulEmail = async (
  t: TFunction,
  user: LeanUser,
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:successfulreset.subject'),
    html: '',
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw error
  }
}

// Email des codes de secours 2FA
export const sendTwoFactorBackupCodesEmail = async (
  t: TFunction,
  user: LeanUser,
  backupCodes: string[],
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:backupcodes.subject'),
    html: '',
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error)
    throw error
  }
}

// Envoyer un code 2FA par email
export const sendTwoFactorEmail = async (
  t: TFunction,
  user: LeanUser,
  code: string,
  expiration: string,
  context: 'config' | 'login' | 'disable' = 'config',
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:email2FAcode.subject'),
    html:
      context === 'config'
        ? EmailTwoFactorActivation(t, user, code, expiration)
        : context === 'login'
        ? EmailTwoFactorLogin(t, user, code, expiration)
        : EmailTwoFactorDeactivation(t, user, code, expiration),
  }
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi du code 2FA par email:", error)
    throw error
  }
}

// Envoyer un code de changement d'email
export const sendChangeEmailStep1 = async (
  t: TFunction,
  user: LeanUser,
  verificationCode: string,
  expiration: string,
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:emailchange1.subject'),
    html: ChangeEmailStep1(t, user, verificationCode, expiration),
  }
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi du code de changement d'email:",
      error,
    )
    throw error
  }
}

export const sendChangeEmailStep2 = async (
  t: TFunction,
  user: LeanUser,
  verificationCode: string,
  expiration: string,
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:emailchange2.subject'),
    html: ChangeEmailStep2(t, user, verificationCode, expiration),
  }
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi du code de changement d'email:",
      error,
    )
    throw error
  }
}
