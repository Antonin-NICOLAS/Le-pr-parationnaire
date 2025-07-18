const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const CryptoJS = require('crypto-js')
const bcrypt = require('bcryptjs')

// Générer un secret pour la 2FA
const generateTwoFactorSecret = () => {
  return speakeasy.generateSecret({
    name: 'Stepify',
    length: 20,
  })
}

// Hacher le code de vérification par email
const hashEmailCode = async (code) => {
  const hashedPassword = await bcrypt.hash(code, 12)
  return hashedPassword
}

// Comparer le code de vérification par email
const compareEmailCode = async (hashedCode, plainCode) => {
  const isMatch = await bcrypt.compare(plainCode, hashedCode)
  return isMatch
}

// Générer un QR code pour la 2FA
const generateQRCode = async (secret) => {
  try {
    return await QRCode.toDataURL(secret.otpauth_url)
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error)
    throw error
  }
}

// Vérifier le code 2FA
const verifyTwoFactorCode = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1,
  })
}

// Générer des codes de secours
const generateBackupCodes = (count = 8) => {
  const codes = []
  for (let i = 0; i < count; i++) {
    const randomValue = Date.now().toString() + Math.random().toString()
    const hash = CryptoJS.SHA256(randomValue)
      .toString(CryptoJS.enc.Hex)
      .toUpperCase()
    const code = hash.substring(0, 8)
    codes.push({
      code: code,
      used: false,
    })
  }
  return codes
}

// Vérifier un code de secours
const verifyBackupCode = (user, code) => {
  const backupCode = user.twoFactor.backupCodes.find(
    (bc) => bc.code === code && !bc.used,
  )

  if (backupCode) {
    backupCode.used = true
    return true
  }
  return false
}

module.exports = {
  generateTwoFactorSecret,
  hashEmailCode,
  compareEmailCode,
  generateQRCode,
  verifyTwoFactorCode,
  generateBackupCodes,
  verifyBackupCode,
}
