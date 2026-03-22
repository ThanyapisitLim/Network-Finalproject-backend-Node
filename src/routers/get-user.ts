import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { decodedToken } from '../controllers/token';
import { getUserByUserId } from '../controllers/user';
const router = express.Router();

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];
        if (!accessToken) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }
        const userId = decodedToken(accessToken);
        const user = await getUserByUserId(userId.userId);

        res.send(user)
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

export default router;