/**
 * @swagger
 * tags:
 *   - name: Two-Factor Authentication
 *     description: Gestion de l'authentification à deux facteurs (2FA)
 */

/**
 * @swagger
 * /auth/2fa/status:
 *   get:
 *     tags: [Two-Factor Authentication]
 *     summary: Obtenir le statut complet de la 2FA
 *     description: |
 *       Retourne le statut détaillé de la 2FA incluant toutes les méthodes activées,
 *       les clés WebAuthn et les codes de secours.
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
 *                       description: Statut global de la 2FA
 *                     loginWithWebAuthn:
 *                       type: boolean
 *                       description: Indique si l'authentification principale par WebAuthn est activée
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
 *                     primaryCredentials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WebAuthnCredential'
 *                     secondaryCredentials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WebAuthnCredential'
 *                       description: Clés d'accès WebAuthn enregistrées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/login:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Valider la deuxième étape d'authentification
 *     description: |
 *       Valide le code 2FA après une connexion initiale réussie.
 *       Accepte les codes d'application, email ou codes de secours.
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
 *                 description: Prolonge la session à 7 jours si true
 *               method:
 *                 type: string
 *                 enum: [email, app, backup_code, webauthn]
 *               value:
 *                 type: string
 *                 description: |
 *                   Code selon la méthode :
 *                   - Code à 6 chiffres pour 'app'
 *                   - Code email pour 'email'
 *                   - Code de secours pour 'backup_code'
 *                   - Réponse WebAuthn pour 'webauthn'
 *     responses:
 *       200:
 *         description: Connexion 2FA réussie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
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
 *                   error: "Tous les champs sont requis."
 *               not_enabled:
 *                 value:
 *                   success: false
 *                   error: "La double authentification n'est pas activée."
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "La méthode fournie est invalide."
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Le code est incorrect."
 *               invalid_backup_code:
 *                 value:
 *                   success: false
 *                   error: "Le code de sauvegarde est incorrect."
 *               backup_code_used:
 *                 value:
 *                   success: false
 *                   error: "Le code de secours a déjà été utilisé."
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
 *       Change la méthode de vérification 2FA préférée.
 *       La méthode doit être déjà activée pour l'utilisateur.
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
 *         description: Méthode préférée mise à jour
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
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "La méthode fournie est invalide."
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
 *     summary: Initialiser la 2FA par email
 *     description: |
 *       Lance le processus d'activation de la 2FA par email.
 *       Envoie un code de vérification à l'email de l'utilisateur.
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Code de vérification envoyé
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
 *             example:
 *               success: false
 *               error: "La 2FA par email est déjà activée"
 *       403:
 *         description: Email non vérifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InfoResponse'
 *             example:
 *               success: false
 *               message: "Votre adresse email n'est pas vérifiée."
 *               requiresVerification: true
 *               email: "jean.dupont@example.com"
 *               rememberMe: false
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
 *       Active la 2FA par email après vérification du code.
 *       Génère des codes de secours si c'est la première méthode activée.
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
 *         description: 2FA email activée
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
 *         description: Code invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Le code est incorrect."
 *               code_expired:
 *                 value:
 *                   success: false
 *                   error: "Le code envoyé par email a expiré."
 *               setup_required:
 *                 value:
 *                   success: false
 *                   error: "Veuillez réessayer de configurer la méthode."
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
 *       Désactive la 2FA par email après vérification par mot de passe ou code OTP.
 *       Met à jour la méthode préférée si nécessaire.
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
 *               - value
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [password, otp]
 *                 description: |
 *                   Méthode de vérification :
 *                   - 'password' pour utiliser le mot de passe
 *                   - 'otp' pour utiliser le code OTP de l'application
 *               value:
 *                 type: string
 *                 description: |
 *                   Valeur de vérification selon la méthode :
 *                   - Mot de passe pour 'password'
 *                   - Code à 6 chiffres pour 'otp'
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: 2FA email désactivée
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
 *             examples:
 *               missing_fields:
 *                value:
 *                  success: false
 *                  error: "Tous les champs sont requis."
 *               not_enabled:
 *                 value:
 *                   success: false
 *                   error: "La 2FA par email n'est pas activée."
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "La méthode fournie est invalide."
 *               password_incorrect:
 *                 value:
 *                   success: false
 *                   error: "Le mot de passe est incorrect."
 *               code_expired:
 *                 value:
 *                   success: false
 *                   error: "Le code a expiré."
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Le code est incorrect."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/email/resend/{context}:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Renvoyer un code de vérification email
 *     description: |
 *       Renvoie un code selon le contexte (login, config, disable).
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     parameters:
 *       - in: path
 *         name: context
 *         required: true
 *         schema:
 *           type: string
 *           enum: [login, config, disable]
 *         description: Contexte d'utilisation du code
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 required: context === 'login'
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
 *         description: Contexte invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_context:
 *                 value:
 *                   success: false
 *                   error: "Contexte invalide"
 *               missing_email:
 *                 value:
 *                   success: false
 *                   error: "Email requis pour le contexte de connexion"
 *       401:
 *         description: Non autorisé (pour les contextes config/disable)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
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
 *       Génère un secret et un QR code pour l'application d'authentification.
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Configuration initialisée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                     qrCode:
 *                       type: string
 *                       format: byte
 *                       description: |
 *                         QR code au format base32 contenant le secret et les métadonnées
 *                         pour l'application d'authentification
 *       400:
 *         description: Déjà configuré
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
 *       Active la 2FA par app après vérification du code.
 *       Génère des codes de secours si première méthode activée.
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
 *                 description: Code à 6 chiffres généré par l'application
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA app activée
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
 *         description: Code invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Le code est incorrect."
 *               setup_required:
 *                 value:
 *                   success: false
 *                   error: "Veuillez réessayer de configurer la méthode."
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
 *       Désactive la 2FA par app après vérification par mot de passe ou code OTP.
 *       Met à jour la méthode préférée si nécessaire.
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
 *               - value
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [password, otp]
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA app désactivée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     preferredMethod:
 *                       type: string
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Vérification échouée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     tags: [Two-Factor Authentication]
 *     summary: Désactiver complètement la 2FA
 *     description: |
 *       Désactive toutes les méthodes 2FA après vérification.
 *       Accepte mot de passe, code email, code app, WebAuthn ou code de secours.
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
 *               - value
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [password, email, app, webauthn, backup_code]
 *               value:
 *                 type: string
 *                 description: |
 *                   Valeur de vérification selon la méthode :
 *                   - Mot de passe pour 'password'
 *                   - Code à 6 chiffres pour 'email' et 'app'
 *                   - AssertionResponse pour 'webauthn'
 *                   - Code de secours pour 'backup_code'
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: 2FA désactivée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     preferredMethod:
 *                       type: string
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours mis à jour
 *             example:
 *               success: true
 *               message: "2FA désactivée"
 *               preferredMethod: "email"
 *               backupCodes: ["GHI789", "JKL012"]
 *       400:
 *         description: Vérification échouée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non autorisé (pour les contextes config/disable)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         description: Trop de requêtes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
