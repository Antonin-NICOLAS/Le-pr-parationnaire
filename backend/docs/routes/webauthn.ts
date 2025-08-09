/**
 * @swagger
 * /auth/webauthn/generate-registration:
 *   get:
 *     tags: [WebAuthn Authentication]
 *     summary: Générer les options d'enregistrement WebAuthn
 *     description: |
 *       Génère les options nécessaires pour enregistrer une nouvelle clé d'accès.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Options d'enregistrement générées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     options:
 *                       type: object
 *                       properties:
 *                         rp:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             id:
 *                               type: string
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             displayName:
 *                               type: string
 *                         challenge:
 *                           type: string
 *                         pubKeyCredParams:
 *                           type: array
 *                           items:
 *                             type: object
 *                         timeout:
 *                           type: number
 *                         attestation:
 *                           type: string
 *                         authenticatorSelection:
 *                           type: object
 *                         excludeCredentials:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "WebAuthn déjà configuré"
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
 * /auth/webauthn/verify-registration:
 *   post:
 *     tags: [WebAuthn Authentication]
 *     summary: Vérifier l'enregistrement WebAuthn
 *     description: |
 *       Vérifie et enregistre une nouvelle clé d'accès après l'enregistrement côté client.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attestationResponse
 *             properties:
 *               attestationResponse:
 *                 type: object
 *                 description: Réponse d'enregistrement du navigateur
 *     responses:
 *       200:
 *         description: Clé d'accès enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     credentialId:
 *                       type: string
 *                     credentials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WebAuthnCredential'
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               challenge_expired:
 *                 value:
 *                   success: false
 *                   error: "Challenge expiré"
 *               credential_exists:
 *                 value:
 *                   success: false
 *                   error: "Cette clé d'accès est déjà enregistrée"
 *               registration_failed:
 *                 value:
 *                   success: false
 *                   error: "Échec de l'enregistrement"
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
 * /auth/webauthn/generate-authentication:
 *   get:
 *     tags: [WebAuthn Authentication]
 *     summary: Générer les options d'authentification WebAuthn
 *     description: |
 *       Génère les options nécessaires pour l'authentification avec une clé d'accès.
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Email de l'utilisateur
 *     responses:
 *       200:
 *         description: Options d'authentification générées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     options:
 *                       type: object
 *                       properties:
 *                         challenge:
 *                           type: string
 *                         timeout:
 *                           type: number
 *                         rpId:
 *                           type: string
 *                         allowCredentials:
 *                           type: array
 *                           items:
 *                             type: object
 *                         userVerification:
 *                           type: string
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "WebAuthn non activé pour cet utilisateur"
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/webauthn/verify-authentication:
 *   post:
 *     tags: [WebAuthn Authentication]
 *     summary: Vérifier l'authentification WebAuthn
 *     description: |
 *       Vérifie l'authentification avec une clé d'accès après la réponse du navigateur.
 *       Protégée par rate limiting (5 requêtes/2 minutes).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - assertionResponse
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               rememberMe:
 *                 type: boolean
 *                 description: Maintenir la session active plus longtemps
 *               assertionResponse:
 *                 type: object
 *                 description: Réponse d'authentification du navigateur
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Authentification réussie"
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
 *               authentication_error:
 *                 value:
 *                   success: false
 *                   error: "Erreur d'authentification"
 *               credential_not_found:
 *                 value:
 *                   success: false
 *                   error: "Clé d'accès non trouvée"
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/webauthn/set-name:
 *   post:
 *     tags: [WebAuthn Management]
 *     summary: Renommer une clé d'accès WebAuthn
 *     description: |
 *       Permet de modifier le nom d'une clé d'accès WebAuthn.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - deviceName
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID de la clé d'accès
 *               deviceName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Nouveau nom pour la clé
 *     responses:
 *       200:
 *         description: Nom de la clé mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_name:
 *                 value:
 *                   success: false
 *                   error: "Nom invalide"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Ressource non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               credential_not_found:
 *                 value:
 *                   success: false
 *                   error: "Clé d'accès non trouvée"
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/webauthn/disable:
 *   post:
 *     tags: [WebAuthn Management]
 *     summary: Désactiver WebAuthn
 *     description: |
 *       Désactive complètement WebAuthn pour l'utilisateur après vérification.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
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
 *                 enum: [password, webauthn]
 *                 description: Méthode de vérification
 *               value:
 *                 type: string
 *                 description: |
 *                   Valeur de vérification (mot de passe ou réponse WebAuthn)
 *     responses:
 *       200:
 *         description: WebAuthn désactivé avec succès
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
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
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
 *                   error: "Méthode et valeur requises"
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "Méthode de vérification invalide"
 *               password_incorrect:
 *                 value:
 *                   success: false
 *                   error: "Mot de passe incorrect"
 *               authentication_error:
 *                 value:
 *                   success: false
 *                   error: "Échec de l'authentification WebAuthn"
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
 * /auth/webauthn/devices:
 *   get:
 *     tags: [WebAuthn Management]
 *     summary: Lister les clés d'accès WebAuthn
 *     description: |
 *       Retourne la liste des clés d'accès WebAuthn enregistrées pour l'utilisateur.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des clés d'accès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     credentials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WebAuthnCredential'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/webauthn/credential/{id}:
 *   delete:
 *     tags: [WebAuthn Management]
 *     summary: Supprimer une clé d'accès WebAuthn
 *     description: |
 *       Supprime une clé d'accès WebAuthn spécifique.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la clé d'accès à supprimer
 *     responses:
 *       200:
 *         description: Clé d'accès supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     credentials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WebAuthnCredential'
 *                     preferredMethod:
 *                       type: string
 *                       enum: [email, app, webauthn, none]
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Ressource non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               credential_not_found:
 *                 value:
 *                   success: false
 *                   error: "Clé d'accès non trouvée"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
