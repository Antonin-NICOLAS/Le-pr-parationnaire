/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: L'identifiant unique de l'utilisateur
 *           example: 507f1f77bcf86cd799439011
 *         lastName:
 *           type: string
 *           description: Le nom de famille de l'utilisateur
 *           example: Dupont
 *         firstName:
 *           type: string
 *           description: Le prénom de l'utilisateur
 *           example: Jean
 *         avatarUrl:
 *           type: string
 *           description: URL de l'avatar de l'utilisateur
 *           example: https://example.com/avatar.jpg
 *           nullable: true
 *         email:
 *           type: string
 *           format: email
 *           description: L'adresse email de l'utilisateur
 *           example: jean.dupont@example.com
 *         password:
 *           type: string
 *           description: Le mot de passe hashé de l'utilisateur
 *           minLength: 8
 *           writeOnly: true
 *         loginWithWebAuthn:
 *           type: boolean
 *           description: Indique si l'utilisateur utilise WebAuthn pour se connecter
 *           default: false
 *         tokenVersion:
 *           type: number
 *           description: Version du token pour invalider les tokens existants
 *           default: 0
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Date de la dernière connexion
 *           nullable: true
 *         lastEmailChange:
 *           type: string
 *           format: date-time
 *           description: Date du dernier changement d'email
 *           nullable: true
 *         loginHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LoginHistory'
 *           description: Historique des connexions de l'utilisateur
 *         emailVerification:
 *           $ref: '#/components/schemas/EmailVerification'
 *         resetPassword:
 *           $ref: '#/components/schemas/ResetPassword'
 *         twoFactor:
 *           $ref: '#/components/schemas/TwoFactorAuth'
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Le rôle de l'utilisateur
 *           default: user
 *         language:
 *           type: string
 *           enum: [en, fr, es, de]
 *           description: La langue préférée de l'utilisateur
 *           default: en
 *         theme:
 *           type: string
 *           enum: [dark, light, auto]
 *           description: Le thème préféré de l'utilisateur
 *           default: light
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du compte
 *
 *     LoginHistory:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           description: ID unique de la session
 *           example: 507f1f77bcf86cd799439012
 *         ip:
 *           type: string
 *           description: Adresse IP utilisée pour la connexion
 *           example: 127.0.0.1
 *           nullable: true
 *         userAgent:
 *           type: string
 *           description: User agent du navigateur
 *           nullable: true
 *         location:
 *           type: string
 *           description: Localisation géographique approximative
 *           example: Paris, France
 *           nullable: true
 *         deviceType:
 *           type: string
 *           description: Type de dispositif utilisé
 *           example: Desktop
 *           nullable: true
 *         browser:
 *           type: string
 *           description: Navigateur utilisé
 *           example: Chrome
 *           nullable: true
 *         os:
 *           type: string
 *           description: Système d'exploitation utilisé
 *           example: Windows
 *           nullable: true
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: Dernière activité enregistrée
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration de la session
 *           nullable: true
 *
 *     EmailVerification:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token de vérification
 *           nullable: true
 *         expiration:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration du token
 *           nullable: true
 *         isVerified:
 *           type: boolean
 *           description: Indique si l'email est vérifié
 *           default: false
 *
 *     ResetPassword:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token pour la réinitialisation du mot de passe
 *           nullable: true
 *         expiration:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration du token
 *           nullable: true
 *
 *     TwoFactorAuth:
 *       type: object
 *       properties:
 *         isEnabled:
 *           type: boolean
 *           description: Activation globale de la 2FA
 *           default: false
 *         email:
 *           type: object
 *           properties:
 *             isEnabled:
 *               type: boolean
 *               default: false
 *             token:
 *               type: string
 *               nullable: true
 *             expiration:
 *               type: string
 *               format: date-time
 *               nullable: true
 *         app:
 *           type: object
 *           properties:
 *             isEnabled:
 *               type: boolean
 *               default: false
 *             secret:
 *               type: string
 *               nullable: true
 *         webauthn:
 *           type: object
 *           properties:
 *             isEnabled:
 *               type: boolean
 *               default: false
 *             challenge:
 *               type: string
 *               nullable: true
 *             expiration:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             credentials:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebAuthnCredential'
 *         preferredMethod:
 *           type: string
 *           enum: [email, app, webauthn, none]
 *           default: none
 *         backupCodes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BackupCode'
 *         securityQuestions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SecurityQuestion'
 *
 *     WebAuthnCredential:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique de la clé d'accès
 *         publicKey:
 *           type: string
 *           description: Clé publique au format base64
 *         counter:
 *           type: number
 *           description: Compteur de sécurité
 *         deviceType:
 *           type: string
 *           enum: [security-key, platform]
 *           description: Type d'authentificateur
 *         deviceName:
 *           type: string
 *           description: Nom personnalisé de la clé
 *         transports:
 *           type: array
 *           items:
 *             type: string
 *           description: Méthodes de transport supportées
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         lastUsed:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Dernière utilisation
 *
 *     BackupCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         used:
 *           type: boolean
 *           default: false
 *
 *     SecurityQuestion:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           enum:
 *             - Quelle est votre couleur préférée ?
 *             - Quel est le nom de votre premier animal ?
 *             - Quel est le nom de votre école primaire ?
 *             - Quelle est votre ville natale ?
 *             - Quel est votre plat préféré ?
 *             - Quel est votre film préféré ?
 *         answer:
 *           type: string
 *           writeOnly: true
 *         undefined:
 *           type: boolean
 *           default: true
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: true
 *         message:
 *           type: string
 *           description: Message optionnel
 *           nullable: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         error:
 *           type: string
 *           description: Message d'erreur
 *         details:
 *           type: object
 *           description: Détails supplémentaires sur l'erreur
 *           additionalProperties: true
 *           nullable: true
 *
 *     InfoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         message:
 *           type: string
 *           description: Message optionnel
 *           nullable: false
 */
