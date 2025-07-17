const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    //Informaton
    nom: {
        type: String,
        required: true,
    },
    prenom: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Authentication
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    tokenVersion: { type: Number, default: 0 },
    lastLogin: { type: Date },
    loginHistory: [
        {
            ip: String,
            userAgent: String,
            location: String,
            date: { type: Date, default: Date.now },
        },
    ],
    emailVerification: {
        token: { type: String },
        expiration: { type: Date },
        isVerified: { type: Boolean, default: false },
    },
    resetPassword: {
        token: { type: String },
        expiration: { type: Date },
    },
    TwoFactor: {
        email: { type: Boolean, default: false },
        app: { type: Boolean, default: false },
        webauthn: { type: Boolean, default: false },
        secret: { type: String },
        backupCodes: [{ type: String }],
        securityQuestions: [
            {
                question: String,
                answer: { type: String, select: false },
            },
        ],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    language: {
        type: String,
        enum: ['en', 'fr', 'es', 'de'],
        default: 'en',
    },
    theme: {
        type: String,
        enum: ['dark', 'light', 'auto'],
        default: 'light',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('User', UserSchema)
