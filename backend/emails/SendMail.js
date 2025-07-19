const nodemailer = require('nodemailer')
const { EmailVerification } = require('./templates/EmailVerification.js')

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

const sendLoginEmail = async (user, ipAddress, deviceInfo, location) => {
  const { t } = req
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const loginDate = new Date().toLocaleDateString(
    user.languagePreference,
    options,
  )

  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:login.subject', user.language),
    html: '',
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

const sendWelcomeEmail = async (email, prenom) => {
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

const sendResetPasswordEmail = async (user, resetUrl) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:passwordreset.subject'),
    html: '',
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

const sendResetPasswordSuccessfulEmail = async (user) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:successfulreset.subject', user.languagePreference),
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
const sendTwoFactorBackupCodesEmail = async (user, backupCodes) => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: t('emails:backupcodes.subject', user.languagePreference),
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
