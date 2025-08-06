const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const CryptoJS = require('crypto-js')
const UAParser = require('ua-parser-js')
const ms = require('ms')
const { v4: uuidv4 } = require('uuid')

// Password hashing
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Password comparison
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Validators
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateName = (name) => {
  return name.length >= 3 && name.length <= 30
}

const validatePassword = (password) => {
  // Minimum 8 chars, at least one uppercase, one lowercase, one number and one special char
  const passwordRegex =
    /^(?=.*[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÇÑ])(?=.*[a-záéíóúàèìòùâêîôûäëïöüçñ])(?=.*\d)(?=.*[\W_]).{8,}$/
  return passwordRegex.test(password)
}

// Device Info Extraction
const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  const os = parser.getOS()
  const browser = parser.getBrowser()

  return `Appareil: ${device.type} (${device.vendor} ${device.model}), OS: ${os.name} ${os.version}, navigateur: ${browser.name} ${browser.version}`
}

// User Location
const findLocation = async (t, language, ipAddress) => {
  let location = t('auth:unkown_loc')
  try {
    const geoRes = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,zip,lat,lon&lang=${language}`,
    )
    const geoData = await geoRes.json()
    if (geoData.status === 'success') {
      location = `${geoData.city} (${geoData.zip}), ${geoData.regionName}, ${geoData.country}, longitude: ${geoData.lon} , latitude: ${geoData.lat}`
    }
    return location
  } catch (error) {
    console.warn('Erreur lors de la géolocalisation IP:', error)
    return location
  }
}

const detectSimilarDevice = (userAgent1, userAgent2) => {
  if (!userAgent1 || !userAgent2) return false

  const parser = new UAParser()
  const ua1 = parser.setUA(userAgent1).getResult()
  const ua2 = parser.setUA(userAgent2).getResult()
  console.log('Comparing devices:', ua1, ua2)

  // Comparaison basique
  if (ua1.browser.name !== ua2.browser.name) return false
  if (ua1.os.name !== ua2.os.name) return false
  if (ua1.device.type !== ua2.device.type) return false
  if (ua1.device.vendor !== ua2.device.vendor) return false
  if (ua1.cpu.architecture !== ua2.cpu.architecture) return false

  // Comparaison plus avancée pour les mobiles
  if (ua1.device.type === 'mobile' || ua2.device.type === 'mobile') {
    return ua1.device.model === ua2.device.model
  }

  return true
}

// Cookie Generation

const generateToken = (user, duration, sessionId) => {
  return jwt.sign(
    {
      jti: sessionId || uuidv4(),
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: duration,
      algorithm: 'HS256',
    },
  )
}

// Génération de cookie sécurisé
const generateCookie = (res, user, stayLoggedIn = false, sessionId = null) => {
  const duration = stayLoggedIn
    ? process.env.SESSION_DURATION_LONG
    : process.env.SESSION_DURATION_SHORT

  // Si aucun sessionId n'est fourni, on en génère un nouveau
  const finalSessionId = sessionId || uuidv4()
  const token = generateToken(user, duration, finalSessionId)

  const options = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: ms(duration),
    path: '/',
    ...(process.env.NODE_ENV === 'production' && {
      domain: process.env.FRONTEND_SERVER || undefined,
    }),
  }

  res.cookie('jwtauth', token, options)

  res.cookie('sessionId', finalSessionId, {
    ...options,
    httpOnly: false,
  })

  return { token, sessionId: finalSessionId }
}

// Create 6-digit verification code
const generateVerificationCode = () => {
  return CryptoJS.lib.WordArray.random(6).toString().slice(0, 6).toUpperCase()
}

// Create 32-character reset token
const generateResetToken = () => {
  return CryptoJS.lib.WordArray.random(32).toString()
}

module.exports = {
  hashPassword,
  comparePassword,
  validateEmail,
  validateName,
  validatePassword,
  getDeviceInfo,
  findLocation,
  detectSimilarDevice,
  generateCookie,
  generateVerificationCode,
  generateResetToken,
}
