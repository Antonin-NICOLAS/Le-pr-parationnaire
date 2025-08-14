/**
 * @swagger
 * tags:
 *   - name: WebAuthn Authentication
 *     description: Endpoints pour l'authentification WebAuthn (primaire et secondaire)
 *   - name: WebAuthn Management
 *     description: Gestion des clés d'accès WebAuthn
 */

/**
 * @swagger
 * /auth/webauthn/generate-registration:
 *   get:
 *     tags: [WebAuthn Authentication]
 *     summary: Générer les options d'enregistrement WebAuthn
 *     description: |
 *       Génère les options nécessaires pour enregistrer une nouvelle clé d'accès.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *       Le paramètre context détermine si la clé est pour l'authentification principale (primary) ou la 2FA (secondary).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte d'utilisation (primary pour auth principale, secondary pour 2FA)
 *     responses:
 *       200:
 *         description: Options d'enregistrement générées avec succès ou détection de clés existantes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     options:
 *                       type: object
 *                       description: Options d'enregistrement (seulement si RequiresSetName est false)
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
 *                     RequiresSetName:
 *                       type: boolean
 *                       description: Indique si des clés existaient déjà et ont été réactivées
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Requête invalide"
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
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte d'utilisation (primary pour auth principale, secondary pour 2FA)
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
 *                       description: Méthode 2FA préférée (seulement si context=secondary)
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours (seulement si context=secondary et première méthode 2FA activée)
 *                     RequiresSetName:
 *                       type: boolean
 *                       description: Indique si le nom du périphérique doit être défini
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
 *                   error: "Votre clé d'accès n'est pas authentique. Veuillez réessayer."
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
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte d'authentification (primary pour auth principale, secondary pour 2FA)
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
 *             examples:
 *               not_enabled:
 *                 value:
 *                   success: false
 *                   error: "L'authentification par clé d'accès n'est pas activée pour ce contexte."
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   error: "Tous les champs sont requis."
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
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte d'authentification (primary pour auth principale, secondary pour 2FA)
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
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       202:
 *         description: Authentification principale réussie mais 2FA requise
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoResponse'
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
 *                         app:
 *                           type: boolean
 *                         webauthn:
 *                           type: boolean
 *                         preferredMethod:
 *                           type: string
 *                           enum: [email, app, webauthn, none]
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
 *                   error: "La vérification de votre clé d'accès a échouée. Veuillez réessayer plus tard."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Éléments introuvables
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               credential_not_found:
 *                 value:
 *                   success: false
 *                   error: "Votre clé d'accès ne correspond à aucune clé enregistrée."
 *               user_not_found:
 *                 value:
 *                   success: false
 *                   error: "Utilisateur non trouvé"
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/webauthn/transfer:
 *   post:
 *     tags: [WebAuthn Management]
 *     summary: Transférer des clés entre contextes
 *     description: |
 *       Copie des clés WebAuthn d'un contexte à un autre (primary ↔ secondary).
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
 *               - fromContext
 *               - toContext
 *             properties:
 *               fromContext:
 *                 type: string
 *                 enum: [primary, secondary]
 *                 description: Contexte source
 *               toContext:
 *                 type: string
 *                 enum: [primary, secondary]
 *                 description: Contexte destination
 *     responses:
 *       200:
 *         description: Clés transférées avec succès
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
 *                       description: Méthode 2FA préférée (seulement si toContext=secondary)
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours (seulement si toContext=secondary)
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               transfer_same_context:
 *                 value:
 *                   success: false
 *                   error: "Impossible de transférer vers le même contexte"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/UserNotFound'
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
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte de la clé (primary pour auth principale, secondary pour 2FA)
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
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   error: "Tous les champs sont requis."
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
 *                   error: "Votre clé d'accès ne correspond à aucune clé enregistrée."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/webauthn/disable:
 *   post:
 *     tags: [WebAuthn Management]
 *     summary: Désactiver WebAuthn pour un contexte
 *     description: |
 *       Désactive complètement WebAuthn pour l'utilisateur dans le contexte spécifié après vérification.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte à désactiver (primary pour auth principale, secondary pour 2FA)
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
 *                       description: Nouvelle méthode 2FA préférée (seulement si context=secondary)
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours mis à jour (seulement si context=secondary)
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_enabled:
 *                 value:
 *                   success: false
 *                   error: "L'authentification par clé d'accès n'est pas activée."
 *               invalid_method:
 *                 value:
 *                   success: false
 *                   error: "La méthode fournie est invalide."
 *               password_incorrect:
 *                 value:
 *                   success: false
 *                   error: "Le mot de passe est incorrect."
 *               authentication_error:
 *                 value:
 *                   success: false
 *                   error: "La vérification de votre clé d'accès a échoué. Veuillez réessayer plus tard."
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
 *       Retourne la liste des clés d'accès WebAuthn enregistrées pour l'utilisateur dans le contexte spécifié.
 *       Nécessite une authentification valide.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte des clés (primary pour auth principale, secondary pour 2FA)
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
 *       Supprime une clé d'accès WebAuthn spécifique dans le contexte donné.
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
 *       - in: query
 *         name: context
 *         schema:
 *           type: string
 *           enum: [primary, secondary]
 *         required: true
 *         description: Contexte de la clé (primary pour auth principale, secondary pour 2FA)
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
 *                       description: Nouvelle méthode 2FA préférée (seulement si context=secondary)
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de secours mis à jour (seulement si context=secondary)
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
 *                   error: "Votre clé d'accès ne correspond à aucune clé enregistrée."
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
