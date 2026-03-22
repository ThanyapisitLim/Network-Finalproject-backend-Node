import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { checkExistingGmail } from '../controllers/user';

const router = express.Router();

router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { gmail } = req.body;

        if (!gmail) {
            return res.status(400).json({
                error: "Gmail is required",
            });
        }

        const existingGmail = await checkExistingGmail(gmail);

        return res.status(200).json({
            exists: existingGmail.length > 0,
        });

    } catch (error) {
        next(error);
    }
});

export default router;