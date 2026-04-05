import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { login } from '../controllers/user';
import { generateAccessToken, generateRefreshToken, storeToken } from '../controllers/token';

const router = express.Router();

router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { gmail } = req.body;
        if (!gmail) {
            return res.status(400).json({
                error: 'Gmail is required'
            });
        }
        const check = await login(gmail);

        if (check.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const user = check[0];
        const accessToken = generateAccessToken(user.user_id);
        const refreshToken = generateRefreshToken(user.user_id, accessToken);

        // store refresh token in DB
        await storeToken(user.user_id, refreshToken);

        // set refresh token cookie (HttpOnly)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            message: "Login success",
            data: check,
            accessToken: accessToken
        });
    } catch (error) {
        next(error);
    }
});

export default router;