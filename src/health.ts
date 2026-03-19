import express from 'express';
import type { Request, Response, NextFunction } from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', function (req: Request, res: Response, next: NextFunction) {
    res.send('it OK by Tar');
});

export default router;