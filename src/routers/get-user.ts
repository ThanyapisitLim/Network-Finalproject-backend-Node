import express from "express";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { getUserByUserId } from "../controllers/user";

const router = express.Router();

router.get("/", verifyToken, async (req: AuthRequest, res) => {

    const user = await getUserByUserId(req.user!.userId);

    res.json(user);

});

export default router;