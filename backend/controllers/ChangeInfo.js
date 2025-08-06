const User = require('../models/User')
const {
  hashPassword,
  comparePassword,
  validatePassword,
  validateEmail,
  generateVerificationCode,
} = require('../helpers/AuthHelpers')
const {
  sendChangeEmailStep1,
  sendChangeEmailStep2,
} = require('../emails/SendMail')

const changePassword = async (req, res) => {
  const { t } = req
  try {
    const { currentPassword, newPassword } = req.body
    const user = req.user

    // 1. Validation des champs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.missing_fields'),
      })
    }

    // 2. Vérification de l'ancien mot de passe
    const isMatch = await comparePassword(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: t('auth:errors.invalid_password'),
      })
    }

    // 3. Vérification du nouveau mot de passe
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_password'),
      })
    }

    // 4. Mise à jour du mot de passe
    console.log(user.password)
    await User.findByIdAndUpdate(user._id, {
      password: await hashPassword(newPassword),
    })

    return res.status(200).json({
      success: true,
      message: t('auth:success.password_changed'),
    })
  } catch (err) {
    console.error('Change password error:', err)
    return res
      .status(500)
      .json({ success: false, error: t('common:errors.server_error') })
  }
}

///////// CHANGE EMAIL FLOW ////////

// 1. Send email verification to current email
const changeEmailStep1 = async (req, res) => {
  const { t } = req

  try {
    const user = await User.findById(req.user._id)
    // 1. Generate a verification code
    if (
      !user.emailVerification.token ||
      user.emailVerification.expiration < new Date()
    ) {
      const verificationCode = generateVerificationCode()
      const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)
      // 2. Update user
      await User.findByIdAndUpdate(user._id, {
        emailVerification: {
          token: verificationCode,
          expiration: expiration,
        },
      })
    }

    // 3. Send email with verification code
    await sendChangeEmailStep1(t, user, user.emailVerification.token)

    return res.status(200).json({
      success: true,
      message: t('auth:success.emailchange1_sent'),
    })
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de changement d'email :",
      error,
    )
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

// 2. Enter new email, validate it, and send verification code to new email
const changeEmailStep3 = async (req, res) => {
  const { t } = req
  try {
    const user = await User.findById(req.user._id)
    const { email } = req.body

    // 1. Validation de l'email rentré
    if (!email || !validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: t('auth:errors.invalid_email') })
    }

    // 2. Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.email_exists'),
      })
    }

    // 3. Génération d'un code OTP
    if (
      !user.emailVerification.token ||
      user.emailVerification.expiration < new Date()
    ) {
      const verificationCode = generateVerificationCode()
      const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000)
      // 4. Update user
      user.email = email
      user.emailVerification.isVerified = false
      user.emailVerification.token = verificationCode
      user.emailVerification.expiration = expiration
      await user.save()
    }

    // 5. Envoi du code de vérification à la nouvelle adresse email
    await sendChangeEmailStep2(t, user, user.emailVerification.token)
    return res.status(200).json({
      success: true,
      message: t('auth:success.emailchange2_sent'),
    })
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi du code à la nouvelle adresse mail:",
      error,
    )
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}
// 3. Verify new email with code
const changeEmailStep2Step4 = async (req, res) => {
  const { t } = req
  try {
    const user = await User.findById(req.user._id)
    const { code } = req.body

    // 1. Vérification du code
    if (!code || code.length !== 6 || code !== user.emailVerification.token) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_code'),
      })
    }

    // 2. Mise à jour de l'email de l'utilisateur
    user.emailVerification.isVerified = true
    user.emailVerification.token = null
    user.emailVerification.expiration = null
    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.email_verified'),
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

const deleteAccount = async (req, res) => {
  const { t } = req
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // Delete user account
    await User.findByIdAndDelete(user._id)

    return res.status(200).json({
      success: true,
      message: t('auth:success.account_deleted'),
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    return res.status(500).json({
      success: false,
      error: t('common:errors.server_error'),
    })
  }
}

// TODO: Change email : si la double authentication est activée, on demande à l'utilisateur s'il veut continuer.

module.exports = {
  changePassword,
  changeEmailStep1,
  changeEmailStep2Step4,
  changeEmailStep3,
  deleteAccount,
}
