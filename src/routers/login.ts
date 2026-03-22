import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { login } from '../controllers/user';
import { decodedToken, generateAccessToken } from '../controllers/token';

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
        const user = check[0];
        const accessToken = generateAccessToken(user.user_id);

        if (check.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
        });

        res.status(200).json({
            message: "Login success",
            data: check
        });
    } catch (error) {
        next(error);
    }
});

export default router;