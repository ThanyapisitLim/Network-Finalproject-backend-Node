import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { login } from '../controllers/user';

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
        res.status(200).json({
            message: "login success",
            data: check
        });
    } catch (error) {
        next(error);
    }
});

export default router;