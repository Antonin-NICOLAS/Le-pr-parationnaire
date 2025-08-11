/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [User Management]
 *     summary: Changer le mot de passe de l'utilisateur
 *     description: |
 *       Cette route permet à un utilisateur connecté de modifier son mot de passe.
 *       Elle est protégée par un rate limiting (5 requêtes par IP toutes les 2 minutes).
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Le mot de passe actuel
 *                 example: "AncienMotDePasse123!"
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
 *                 example: "NouveauMotDePasse456@"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Votre mot de passe a été modifié."
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
 *                   error: "Les champs currentPassword et newPassword sont requis"
 *               invalid_password:
 *                 value:
 *                   success: false
 *                   error: "Le mot de passe ne respecte pas les exigences de sécurité"
 *               password_mismatch:
 *                 value:
 *                   success: false
 *                   error: "Le mot de passe actuel est incorrect"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/change-email/step1:
 *   post:
 *     tags: [User Management]
 *     summary: Étape 1 - Vérification de l'email actuel
 *     description: |
 *       Cette étape envoie un code de vérification à l'adresse email actuelle de l'utilisateur.
 *       Protégée par rate limiting (5 requêtes/2 minutes) et authentification.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Code de vérification envoyé à l'email actuel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Code de vérification envoyé à votre email actuel"
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
 * /auth/change-email/step2:
 *   post:
 *     tags: [User Management]
 *     summary: Étape 2 - Validation du code de l'email actuel
 *     description: |
 *       Cette étape vérifie le code reçu sur l'email actuel.
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
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: Code de vérification reçu par email
 *                 example: "ABCDEF"
 *     responses:
 *       200:
 *         description: Code de l'email actuel validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Email actuel vérifié avec succès"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_code:
 *                 value:
 *                   success: false
 *                   error: "Le code de vérification est requis"
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Code de vérification invalide"
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
 * /auth/change-email/step3:
 *   post:
 *     tags: [User Management]
 *     summary: Étape 3 - Saisie et vérification du nouvel email
 *     description: |
 *       Cette étape valide le nouvel email et envoie un code de vérification à cette nouvelle adresse.
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nouvelle adresse email
 *                 example: "nouvel.email@example.com"
 *     responses:
 *       200:
 *         description: Code de vérification envoyé au nouvel email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Code de vérification envoyé à votre nouvel email"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_email:
 *                 value:
 *                   success: false
 *                   error: "L'email est requis"
 *               invalid_email:
 *                 value:
 *                   success: false
 *                   error: "L'email n'est pas valide"
 *               email_exists:
 *                 value:
 *                   success: false
 *                   error: "Cet email est déjà utilisé"
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
 * /auth/change-email/step4:
 *   post:
 *     tags: [User Management]
 *     summary: Étape 4 - Validation finale du changement d'email
 *     description: |
 *       Cette étape finale vérifie le code reçu sur le nouvel email et valide le changement d'email.
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
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: Code de vérification reçu par email
 *                 example: "GHIJKL"
 *     responses:
 *       200:
 *         description: Email changé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Email changé avec succès"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_code:
 *                 value:
 *                   success: false
 *                   error: "Le code de vérification est requis"
 *               invalid_code:
 *                 value:
 *                   success: false
 *                   error: "Code de vérification invalide"
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
 * /auth/delete-account:
 *   delete:
 *     tags: [User Management]
 *     summary: Supprimer définitivement le compte utilisateur
 *     description: |
 *       Cette route permet à un utilisateur connecté de supprimer définitivement son compte.
 *       Cela déconnectera immédiatement l'utilisateur et supprimera toutes ses données.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Votre compte a été supprimé."
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: |
 *               Supprime les cookies de session.
 *               Exemple: "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
