import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createUser } from '../controllers/user';

const router = express.Router();

/**
 * @swagger
 * /create-user:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user in the database with the provided name and email
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gmail
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *                 example: John Doe
 *               gmail:
 *                 type: string
 *                 description: The user's email
 *                 example: john@gmail.com
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: create user success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Name and email are required
 */
router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { name, gmail } = req.body;
        if (!name || !gmail) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        const data = await createUser(name, gmail);
        res.status(201).json({
            message: "create user success",
            data
        });

    } catch (error) {
        next(error);
    }
});

export default router;