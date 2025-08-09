/**
 * @swagger
 * components:
 *   responses:
 *     RateLimitExceeded:
 *       description: Trop de requêtes - Limite atteinte
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error: "Trop de requêtes. Veuillez réessayer dans 15 minutes."
 */
