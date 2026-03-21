import express from 'express';
import type { Request, Response, NextFunction } from 'express';
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns a simple message to verify the server is running
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: it OK by Tar
 */
router.get('/', function (req: Request, res: Response, next: NextFunction) {
    res.send('it OK by Tar');
});

export default router;