const nodemailer = require('nodemailer')
const { LogIn } = require('./templates/LogIn.js')
const { EmailVerification } = require('./templates/EmailVerification.js')
const { ResetPassword } = require('./templates/ResetPassword.js')

// .env
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SERVICE,
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: true,
  auth: {
    type: 'login',
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})

const sendLoginEmail = async (t, user, ipAddress, deviceInfo, location) => {
  const options = {
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
    throw new Error("Échec de l'envoi de l'email de nouvelle connection")
  }
}

const sendVerificationEmail = async (t, user, verificationCode) => {
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
    throw new Error("Échec de l'envoi de l'email de vérification")
  }
}

const sendWelcomeEmail = async (t, email, prenom) => {
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
    throw new Error("Échec de l'envoi de l'email de bienvenue")
  }
}

const sendResetPasswordEmail = async (t, user, resetUrl) => {
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
    throw new Error(
      "Échec de l'envoi de l'email de réinitialisation de mot de passe",
    )
  }
}

const sendResetPasswordSuccessfulEmail = async (t, user) => {
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
    throw new Error(
      "Échec de l'envoi de l'email du succès de réinitialisation de mot de passe",
    )
  }
}

// Email des codes de secours 2FA
const sendTwoFactorBackupCodesEmail = async (t, user, backupCodes) => {
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
    throw new Error(
      "Échec de l'envoi de l'email des codes de secours pour l'authentification à deux facteurs",
    )
  }
}

// Envoyer un code 2FA par email
const sendTwoFactorEmailCode = async (user, code) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:email2FAcode.subject'),
    html: '',
  }
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Erreur lors de l'envoi du code 2FA par email:", error)
    throw error
  }
}

module.exports = {
  sendLoginEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetPasswordSuccessfulEmail,
  sendTwoFactorBackupCodesEmail,
  sendTwoFactorEmailCode,
}
