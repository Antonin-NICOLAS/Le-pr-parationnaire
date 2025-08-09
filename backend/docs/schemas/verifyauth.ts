/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: Non autorisé - Cookie invalide, expiré, session introuvable ou utilisateur introuvable
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             unauthorized:
 *               value:
 *                 success: false
 *                 error: "Vous n'êtes pas autorisé à effectuer cette action."
 *             session_expired:
 *               value:
 *                 success: false
 *                 error: "La session est expirée. Veuillez vous reconnecter."
 *             user_not_found:
 *               value:
 *                 success: false
 *                 error: "Utilisateur introuvable."
 */
