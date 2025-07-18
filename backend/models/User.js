const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    //Informaton
    lastName: {
        type: String,
        required: true,
    },
    firstName: {
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
            expiresAt: { type: Date, default: Date.now + 2 * 24 * 60 * 60 * 1000 },
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
    twoFactor: {
        email: { 
            isEnabled: { type: Boolean, default: false },
            token: { type: String },
            expiration: { type: Date },
        },
        app: { 
            isEnabled: { type: Boolean, default: false },
            secret: { type: String },
        },
        webauthn: {
            isEnabled: { type: Boolean, default: false },
            challenge: { type: String },
            expiration: { type: Date },
            credentials: [{
                credentialId: { type: String },
                publicKey: { type: String },
                counter: { type: Number },
                deviceType: { type: String },
                deviceName: { type: String },
                transports: [{ type: String }],
                lastUsed: {
                    type: Date,
                    default: Date.now,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                }
            }],
        },
        preferredMethod: {
            type: String,
            enum: ['email', 'app', 'webauthn'],
            default: 'email',
        },
        backupCodes: [
            {
                code: String,
                used: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
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
