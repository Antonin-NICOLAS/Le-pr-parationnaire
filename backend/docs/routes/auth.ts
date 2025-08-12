/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Rafraîchir le token d'accès
 *     description: |
 *       Cette route permet de rafraîchir le token d'accès expiré en utilisant
 *       le refresh token stocké dans les cookies.
 *       Nécessite un cookie de session valide et un refresh token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Nouveau token d'accès généré
 *             example:
 *               success: true
 *               message: "Token rafraîchi avec succès"
 *               accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: |
 *               Met à jour les cookies 'accessToken' et 'refreshToken'.
 *       401:
 *         description: Erreur d'authentification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_refresh_token:
 *                 value:
 *                   success: false
 *                   error: "Non autorisé - Refresh token manquant"
 *               invalid_session:
 *                 value:
 *                   success: false
 *                   error: "Session introuvable"
 *               session_expired:
 *                 value:
 *                   success: false
 *                   error: "Session expirée"
 *               invalid_refresh_token:
 *                 value:
 *                   success: false
 *                   error: "Refresh token invalide"
 *       404:
 *         description: Session introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Session introuvable"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Vérifier la session active - OK
 *     description: |
 *       Cette route permet de vérifier si l'utilisateur est connecté
 *       et retourne ses informations de profil essentielles.
 *       Nécessite un cookie de session valide.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session valide - Informations utilisateur retournées
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de l'utilisateur
 *                         email:
 *                           type: string
 *                           format: email
 *                         lastName:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         language:
 *                           type: string
 *                           enum: [en, fr, es, de]
 *                         theme:
 *                           type: string
 *                           enum: [dark, light, auto]
 *                         role:
 *                           type: string
 *                           enum: [user, admin]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Déconnexion de l'utilisateur - OK
 *     description: |
 *       Cette route déconnecte l'utilisateur en invalidant sa session
 *       et en supprimant les cookies de session.
 *       Nécessite un cookie de session valide.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Déconnexion réussie."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: |
 *               Supprime les cookies 'accessToken' et 'sessionId'.
 *               Exemple: "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Registration]
 *     summary: Créer un nouveau compte utilisateur
 *     description: |
 *       Cette route permet de créer un nouveau compte utilisateur.
 *       Un email de vérification est envoyé après l'inscription.
 *       La route est protégée par un rate limiting (5 requêtes par IP toutes les 2 minutes).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - lastName
 *               - firstName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *                 description: L'adresse email de l'utilisateur
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MonMotDePasse123!
 *                 description: |
 *                   Le mot de passe doit contenir au moins :
 *                   - 8 caractères
 *                   - 1 majuscule
 *                   - 1 minuscule
 *                   - 1 chiffre
 *                   - 1 caractère spécial
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *                 description: Le nom de famille (3-30 caractères)
 *               firstName:
 *                 type: string
 *                 example: Jean
 *                 description: Le prénom (3-30 caractères)
 *               rememberMe:
 *                 type: boolean
 *                 default: false
 *                 description: |
 *                   Si true, la session sera prolongée (30 jours au lieu de 1 jour).
 *                   Affecte la durée du cookie de session.
 *     responses:
 *       200:
 *         description: Compte créé avec succès - Email de vérification envoyé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     requiresVerification:
 *                       type: boolean
 *                       example: true
 *                       description: Indique qu'une vérification email est nécessaire
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: jean.dupont@example.com
 *                       description: L'email de l'utilisateur inscrit
 *                     rememberMe:
 *                       type: boolean
 *                       example: false
 *                       description: État de la session prolongée
 *       400:
 *         description: Erreur de validation des champs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   error: "Tous les champs sont obligatoires"
 *               invalid_email:
 *                 value:
 *                   success: false
 *                   error: "L'email n'est pas valide"
 *               invalid_password:
 *                 value:
 *                   success: false
 *                   error: "Le mot de passe ne respecte pas les exigences de sécurité"
 *               invalid_name:
 *                 value:
 *                   success: false
 *                   error: "Le nom doit contenir entre 3 et 30 caractères"
 *       409:
 *         description: L'email est déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Cet email est déjà utilisé"
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags: [Registration]
 *     summary: Vérifier l'email d'un utilisateur
 *     description: |
 *       Cette route permet de vérifier l'email d'un utilisateur avec le code reçu.
 *       Si la vérification réussit, l'utilisateur est connecté automatiquement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *                 example: ABC123
 *                 description: Le code de vérification reçu par email
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *                 description: L'email à vérifier
 *               rememberMe:
 *                 type: boolean
 *                 default: false
 *                 description: |
 *                   Si true, la session sera prolongée (30 jours au lieu de 1 jour)
 *     responses:
 *       200:
 *         description: Email vérifié avec succès - Utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Votre adresse est maintenant verifiée."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               Exemple: "accessToken=biunusjcrekzlaxknjqvslfcmiqjomke; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   error: "Tous les champs sont requis."
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Le code est incorrect."
 *               code_expired:
 *                 value:
 *                   success: false
 *                   error: "Le code est expiré."
 *               already_verified:
 *                 value:
 *                   success: false
 *                   error: "Votre adresse email est déjà vérifiée."
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/resend-verification-email:
 *   post:
 *     tags: [Registration]
 *     summary: Renvoyer l'email de vérification
 *     description: |
 *       Cette route permet de renvoyer l'email de vérification à un utilisateur.
 *       Un nouveau code est généré si l'ancien a expiré.
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
 *                 example: jean.dupont@example.com
 *                 description: L'email à vérifier
 *     responses:
 *       200:
 *         description: Email de vérification renvoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Un nouveeau courriel de vérification a été envoyé à votre adresse mail."
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_email:
 *                 value:
 *                   success: false
 *                   error: "Le format de l'adresse mail n'est pas valide."
 *               already_verified:
 *                 value:
 *                   success: false
 *                   error: "Votre adresse email est déjà vérifiée."
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/status:
 *   get:
 *     tags: [Login Flow]
 *     summary: Vérifier le statut d'authentification
 *     description: |
 *       Cette route permet de vérifier si un utilisateur peut se connecter via WebAuthn.
 *       Elle est utilisée avant le login pour déterminer la méthode de connexion.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: L'email de l'utilisateur à vérifier
 *         example: jean.dupont@example.com
 *     responses:
 *       200:
 *         description: Statut d'authentification récupéré
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     webauthn:
 *                       type: boolean
 *                       description: |
 *                         Si true, l'utilisateur peut se connecter avec WebAuthn.
 *                         Si false, il doit utiliser un mot de passe.
 *                       example: true
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Login Flow]
 *     summary: Connexion d'un utilisateur
 *     description: |
 *       Cette route permet à un utilisateur de se connecter.
 *       Si l'email n'est pas vérifié, un nouveau code est envoyé.
 *       Si la 2FA est activée, la réponse indiquera les méthodes disponibles.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MonMotDePasse123!
 *               rememberMe:
 *                 type: boolean
 *                 default: false
 *                 description: |
 *                   Si true, la session sera prolongée (30 jours au lieu de 1 jour)
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Connexion réussie."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: |
 *                 Ajoute le cookie de session 'accessToken' pour initialiser la session.
 *               example: accessToken=abcde12345; Path=/; HttpOnly
 *       202:
 *         description: 2FA requis - Réponse avec les méthodes disponibles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     requiresTwoFactor:
 *                       type: boolean
 *                       example: true
 *                     twoFactor:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: boolean
 *                           description: 2FA par email activée
 *                         app:
 *                           type: boolean
 *                           description: 2FA par app activée
 *                         webauthn:
 *                           type: boolean
 *                           description: 2FA par webauthn activée
 *                         preferredMethod:
 *                           type: string
 *                           enum: [email, app, webauthn, none]
 *                           description: Méthode de 2FA préférée
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_credentials:
 *                 value:
 *                   success: false
 *                   error: "Email et mot de passe requis."
 *               invalid_email:
 *                 value:
 *                   success: false
 *                   error: "Le format de l'adresse email n'est pas valide."
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
 *       404:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Email ou mot de passe incorrect."
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Forgot Password Flow]
 *     summary: Demande de réinitialisation de mot de passe - OK
 *     description: |
 *       Cette route initie le processus de réinitialisation de mot de passe.
 *       Un email est envoyé avec un lien de réinitialisation valable 1 heure.
 *       Pour des raisons de sécurité, la réponse est toujours positive même si l'email n'existe pas.
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
 *                 example: jean.dupont@example.com
 *                 description: L'email associé au compte
 *     responses:
 *       200:
 *         description: |
 *           Email envoyé si l'email existe et est vérifié.
 *           Réponse identique même si l'email n'existe pas (pour des raisons de sécurité).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Si elle est enregistrée, un courriel de réinitialisation a été envoyé à l'adresse mail fournie."
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
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "L'email n'est pas valide"
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/resend-forgot-password:
 *   post:
 *     tags: [Forgot Password Flow]
 *     summary: Renvoyer le lien de réinitialisation - OK
 *     description: |
 *       Cette route permet de renvoyer le lien de réinitialisation de mot de passe.
 *       Si le token existant est encore valide, il est réutilisé, sinon un nouveau est généré.
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
 *                 example: jean.dupont@example.com
 *                 description: L'email associé au compte
 *     responses:
 *       200:
 *         description: Email de réinitialisation renvoyé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Si elle est enregistrée, un courriel de réinitialisation a été envoyé à l'adresse mail fournie."
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Le format de l'adresse mail n'est pas valide"
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
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Forgot Password Flow]
 *     summary: Réinitialiser le mot de passe - OK
 *     description: |
 *       Cette route permet de définir un nouveau mot de passe après vérification du token.
 *       Le token doit avoir été obtenu via le lien envoyé par email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               token:
 *                 type: string
 *                 description: Token reçu par email
 *                 example: "abc123def456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: |
 *                   Le nouveau mot de passe doit contenir :
 *                   - 8 caractères minimum
 *                   - 1 majuscule
 *                   - 1 minuscule
 *                   - 1 chiffre
 *                   - 1 caractère spécial
 *                 example: "NouveauMotDePasse123!"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Votre mot de passe a été réinitialisé."
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   error: "Tous les champs sont requis."
 *               invalid_email:
 *                 value:
 *                   success: false
 *                   error: "Le format de l'adresse email n'est pas valide."
 *               invalid_password:
 *                 value:
 *                   success: false
 *                   error: "Le mot de passe ne respecte pas les exigences de sécurité."
 *               invalid_token:
 *                 value:
 *                   success: false
 *                   error: "Lien invalide ou expiré."
 *               token_expired:
 *                 value:
 *                   success: false
 *                   error: "Le lien a expiré."
 *               similar_password:
 *                 value:
 *                   success: false
 *                   error: "Vous ne pouvez pas utiliser votre mot de passe actuel comme nouveau mot de passe."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/active-sessions:
 *   get:
 *     tags: [Session Management]
 *     summary: Récupérer les sessions actives - OK
 *     description: |
 *       Cette route retourne la liste de toutes les sessions actives de l'utilisateur,
 *       à l'exception de la session courante.
 *       Nécessite une authentification valide.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des sessions actives récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sessionId:
 *                             type: string
 *                             description: ID unique de la session
 *                           ip:
 *                             type: string
 *                             nullable: true
 *                             description: Adresse IP utilisée
 *                           userAgent:
 *                             type: string
 *                             nullable: true
 *                             description: User Agent du navigateur
 *                           location:
 *                             type: string
 *                             nullable: true
 *                             description: Localisation géographique
 *                           deviceType:
 *                             type: string
 *                             nullable: true
 *                             description: Type de dispositif
 *                           browser:
 *                             type: string
 *                             nullable: true
 *                             description: Navigateur utilisé
 *                           os:
 *                             type: string
 *                             nullable: true
 *                             description: Système d'exploitation
 *                           lastActive:
 *                             type: string
 *                             format: date-time
 *                             description: Dernière activité enregistrée
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             description: Date d'expiration de la session
 *                           isCurrent:
 *                             type: boolean
 *                             description: Indique si c'est la session courante
 *                         example:
 *                           sessionId: "a1b2c3d4-e5f6-7890"
 *                           ip: "192.168.1.1"
 *                           userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
 *                           location: "Paris, France"
 *                           deviceType: "desktop"
 *                           browser: "Chrome"
 *                           os: "Windows 10"
 *                           lastActive: "2023-06-15T14:30:00Z"
 *                           expiresAt: "2023-07-15T14:30:00Z"
 *                           isCurrent: false
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/revoke-session/{sessionId}:
 *   delete:
 *     tags: [Session Management]
 *     summary: Révoquer une session spécifique
 *     description: |
 *       Cette route permet de révoquer une session active spécifique.
 *       La session courante ne peut pas être révoquée via cette route.
 *       Nécessite une authentification valide.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la session à révoquer
 *     responses:
 *       200:
 *         description: Session révoquée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "La session est révoquée."
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_session_id:
 *                 value:
 *                   success: false
 *                   error: "Tous les champs sont requis."
 *               revoke_current_session:
 *                 value:
 *                   success: false
 *                   error: "Impossible de révoquer la session courante."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Ressource introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               user_not_found:
 *                 value:
 *                   success: false
 *                   error: "Utilisateur introuvable."
 *               session_not_found:
 *                 value:
 *                   success: false
 *                   error: "Session introuvable."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/revoke-all-sessions:
 *   delete:
 *     tags: [Session Management]
 *     summary: Révoquer toutes les sessions - OK
 *     description: |
 *       Cette route révoque toutes les sessions actives de l'utilisateur,
 *       y compris la session courante (ce qui déconnectera l'utilisateur).
 *       Nécessite une authentification valide.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les sessions révoquées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Toutes les sessions ont été révoquées"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: |
 *               Supprime les cookies de session.
 *               Exemple: "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
