// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
    try {
        // 1. Vérifier le token dans les cookies ou le header Authorization
        let token =
            req.cookies?.jwtauth || req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                error: req.t('auth:errors.unauthorized'),
            })
        }

        // 2. Vérifier et décoder le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // 3. Récupérer l'utilisateur avec les informations de session
        const user = await User.findById(decoded.id)
            .select('-password -emailVerification.token')
            .lean()

        if (!user) {
            return res.status(401).json({
                success: false,
                error: req.t('auth:errors.user_not_found'),
            })
        }

        // 4. Vérifier si le token a été révoqué (pour logout)
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({
                success: false,
                error: req.t('auth:errors.session_expired'),
            })
        }

        // 5. Attacher l'utilisateur et le token à la requête
        req.user = user
        req.token = token
        next()
    } catch (err) {
        console.error('Authentication error:', err)

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: req.t('auth:errors.session_expired'),
            })
        }

        return res.status(401).json({
            success: false,
            error: req.t('auth:errors.invalid_token'),
        })
    }
}

// Middleware de vérification de rôle
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles]
    }

    return (req, res, next) => {
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: req.t('auth:errors.unauthorized_role'),
            })
        }
        next()
    }
}

module.exports = { authenticate, authorize }
