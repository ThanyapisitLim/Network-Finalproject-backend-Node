import express from "express";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { getUserByUserId } from "../controllers/user";
import redisClient from "../config/redis";

const router = express.Router();

router.get("/", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const cacheKey = `user:${userId}`;

        const cachedUser = await redisClient.get(cacheKey);

        if (cachedUser) {
            console.log("🟢 ข้อมูล User ดึงมาจาก Redis Cache");
            return res.json(JSON.parse(cachedUser));
        }

        console.log("🔴 ข้อมูล User ดึงมาจาก Database");
        const user = await getUserByUserId(userId);

        if (user && user.length > 0) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
        }

        res.json(user);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;