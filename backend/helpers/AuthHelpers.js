const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const CryptoJS = require('crypto-js')
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
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
}

// User Location
const findLocation = async (language, ipAddress) => {
    let location = t('auth:unkown_loc')
    try {
        const geoRes = await fetch(
            `http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,zip,lat,lon&lang=${language}`
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

// Cookie Generation

const generateToken = (user, duration) => {
    const jwtId = uuidv4()

    return jwt.sign(
        {
            jti: jwtId,
            id: user._id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: duration,
            algorithm: 'HS256',
        }
    )
}

// Génération de cookie sécurisé
const generateCookie = (res, user, stayLoggedIn) => {
    const duration = stayLoggedIn
        ? process.env.SESSION_DURATION_LONG
        : process.env.SESSION_DURATION_SHORT

    const token = generateToken(user, duration)

    const options = {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: ms(duration),
        path: '/',
        domain: process.env.FRONTEND_SERVER || undefined,
    }

    res.cookie('jwtauth', token, options)
    return token
}

// Create 6-digit verification code
const generateVerificationCode = () => {
    return CryptoJS.lib.WordArray.random(6).toString().slice(0, 6)
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
    findLocation,
    generateCookie,
    generateVerificationCode,
    generateResetToken,
}
