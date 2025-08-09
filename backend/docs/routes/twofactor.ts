/**
 * @swagger
 * /auth/2fa/status:
 *   get:
 *     tags: [Two-Factor Authentication]
 *     summary: Obtenir le statut de la 2FA
 *     description: |
 *       Cette route retourne le statut actuel de la double authentification pour l'utilisateur,
 *       incluant les méthodes activées et les codes de secours.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statut 2FA récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     isEnabled:
 *                       type: boolean
 *                       description: Indique si la 2FA est activée globalement
 *                     email:
 *                       type: object
 *                       properties:
 *                         isEnabled:
 *                           type: boolean
 *                           description: Indique si la 2FA par email est activée
 *                     app:
 *                       type: object
 *                       properties:
 *                         isEnabled:
 *                           type: boolean
 *                           description: Indique si la 2FA par application est activée
 *                     webauthn:
 *                       type: object
 *                       properties:
 *                         isEnabled:
 *                           type: boolean
 *                           description: Indique si la 2FA par WebAuthn est activée
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                       description: Méthode 2FA préférée
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours disponibles
 *                     credentials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WebAuthnCredential'
 *                       description: Clés d'accès WebAuthn enregistrées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/login:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Connexion avec vérification 2FA
 *     description: |
 *       Cette route permet de valider la deuxième étape d'authentification
 *       après une connexion initiale réussie.
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - method
 *               - value
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               rememberMe:
 *                 type: boolean
 *                 default: false
 *                 description: |
 *                   Si true, la session sera prolongée (30 jours au lieu de 1 jour)
 *               method:
 *                 type: string
 *                 enum: [email, app, backup_code]
 *                 description: Méthode de vérification 2FA
 *               value:
 *                 type: string
 *                 description: |
 *                   Code de vérification selon la méthode :
 *                   - Code à 6 chiffres pour 'app'
 *                   - Code de vérification pour 'email'
 *                   - Code de secours pour 'backup_code'
 *     responses:
 *       200:
 *         description: Connexion 2FA réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Connexion réussie"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: |
 *               Définit les cookies de session
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   error: "Email, méthode et valeur sont requis"
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "Méthode 2FA invalide"
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Code de vérification invalide"
 *               invalid_backup_code:
 *                 value:
 *                   success: false
 *                   error: "Code de secours invalide ou déjà utilisé"
 *       401:
 *         description: Échec d'authentification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "2FA non activée pour cet utilisateur"
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/set-preferred-method:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Définir la méthode 2FA préférée
 *     description: |
 *       Cette route permet de définir la méthode de double authentification préférée.
 *       La méthode doit être préalablement activée pour l'utilisateur.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, app, webauthn]
 *                 description: Méthode 2FA à définir comme préférée
 *     responses:
 *       200:
 *         description: Méthode préférée mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                       description: Nouvelle méthode préférée
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_method:
 *                 value:
 *                   success: false
 *                   error: "La méthode est requise"
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "Méthode 2FA invalide"
 *               method_not_enabled:
 *                 value:
 *                   success: false
 *                   error: "Cette méthode 2FA n'est pas activée"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/email/config:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Configurer la 2FA par email
 *     description: |
 *       Initialise la configuration de la double authentification par email.
 *       Envoie un code de vérification à l'email de l'utilisateur.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Code de vérification envoyé par email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Code de vérification envoyé à votre email"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_not_verified:
 *                 value:
 *                   success: false
 *                   error: "L'email n'est pas vérifié"
 *               already_enabled:
 *                 value:
 *                   success: false
 *                   error: "La 2FA par email est déjà activée"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/email/enable:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Activer la 2FA par email
 *     description: |
 *       Active la double authentification par email après vérification du code.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 description: Code de vérification à 6 chiffres
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA par email activée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours générés
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                       description: Méthode 2FA préférée mise à jour
 *             example:
 *               success: true
 *               message: "2FA par email activée"
 *               backupCodes: ["ABC123", "DEF456"]
 *               preferredMethod: "email"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Code de vérification invalide"
 *               code_expired:
 *                 value:
 *                   success: false
 *                   error: "Le code a expiré"
 *               setup_required:
 *                 value:
 *                   success: false
 *                   error: "Configuration 2FA requise"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/email/disable:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Désactiver la 2FA par email
 *     description: |
 *       Désactive la double authentification par email.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 2FA par email désactivée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                       description: Méthode 2FA préférée mise à jour
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours mis à jour
 *             example:
 *               success: true
 *               message: "2FA par email désactivée"
 *               preferredMethod: "none"
 *               backupCodes: []
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "La 2FA par email n'est pas activée"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/email/resend:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Renvoyer le code de vérification
 *     description: |
 *       Renvoie un nouveau code de vérification pour la 2FA par email.
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *                 example: "utilisateur@example.com"
 *     responses:
 *       200:
 *         description: Nouveau code envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Nouveau code envoyé"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Configuration 2FA requise"
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/app/config:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Configurer la 2FA par application
 *     description: |
 *       Initialise la configuration de la double authentification par application.
 *       Génère un secret et un QR code pour l'application d'authentification.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Configuration 2FA initialisée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                       description: Secret en format base32
 *                       example: "JBSWY3DPEHPK3PXP"
 *                     qrCode:
 *                       type: string
 *                       format: byte
 *                       description: |
 *                         QR code au format base64 contenant le secret et les métadonnées
 *                         pour l'application d'authentification
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "La 2FA par application est déjà activée"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/app/enable:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Activer la 2FA par application
 *     description: |
 *       Active la double authentification par application après vérification du code.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 description: Code à 6 chiffres généré par l'application
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA par application activée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours générés
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                       description: Méthode 2FA préférée mise à jour
 *             example:
 *               success: true
 *               message: "2FA par application activée"
 *               backupCodes: ["ABC123", "DEF456"]
 *               preferredMethod: "app"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Code de vérification invalide"
 *               setup_required:
 *                 value:
 *                   success: false
 *                   error: "Configuration 2FA requise"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/app/disable:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Désactiver la 2FA par application
 *     description: |
 *       Désactive la double authentification par application.
 *       Nécessite une vérification par code et une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 description: Code à 6 chiffres généré par l'application
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: 2FA par application désactivée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                       description: Méthode 2FA préférée mise à jour
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours mis à jour
 *             example:
 *               success: true
 *               message: "2FA par application désactivée"
 *               preferredMethod: "email"
 *               backupCodes: ["GHI789", "JKL012"]
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Code de vérification invalide"
 *               not_enabled:
 *                 value:
 *                   success: false
 *                   error: "La 2FA par application n'est pas activée"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
