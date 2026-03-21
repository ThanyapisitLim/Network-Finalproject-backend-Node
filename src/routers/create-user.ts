import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createUser, getUserId } from '../controllers/user';
import { generateAccessToken, generateRefreshToken, storeToken } from '../controllers/token';

const router = express.Router();

router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { name, gmail } = req.body;
        if (!name || !gmail) {
            return res.status(400).json({
                error: 'Name and Gmail are required'
            });
        }
        const data = await createUser(name, gmail);
        const userId = await getUserId(gmail);

        const accessToken = generateAccessToken(userId[0].user_id);
        const refreshToken = generateRefreshToken(userId[0].user_id, accessToken);
        await storeToken(userId[0].user_id, refreshToken);

        res.status(201).json({
            message: "create user success",
            data,
            accessToken
        });

    } catch (error) {
        next(error);
    }
});

export default router;