import express from "express";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import {
    createMessage,
    getMessagesByUserId,
    deleteMessagesByUserId,
    createGroup,
    deleteGroupById
} from "../controllers/message";
import redisClient from "../config/redis";

const router = express.Router();

//ตอน Chat
router.post("/chat", verifyToken, async (req: AuthRequest, res) => {
    try {
        const { question, groupId } = req.body;

        if (!question) {
            return res.status(400).json({ error: "question is required" });
        }

        const userId = req.user!.userId;
        let finalGroupId = groupId ? parseInt(groupId, 10) : null;

        if (!finalGroupId) {
            const groupName = question.length > 40 ? question.slice(0, 40) + "..." : question;
            const newGroup = await createGroup(groupName);
            finalGroupId = newGroup.group_id as number;
        }

        //เก็บ Message
        const userMessage = await createMessage(userId, "user", question, finalGroupId);

        //ถาม AI
        const AI_API_URL = process.env.AI_API_URL || "http://localhost:8080";
        const aiResponse = await fetch(`${AI_API_URL}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (!aiResponse.ok) {
            console.error("AI API returned status:", aiResponse.status);
            throw new Error("Failed to communicate with AI service");
        }

        const aiData = await aiResponse.json();
        const answer = aiData.answer;

        //Save คำตอบ AI
        const assistantMessage = await createMessage(userId, "assistant", answer, finalGroupId);

        // --- เพิ่ม Redis: ลบ Cache เมื่อมีการสร้างข้อความใหม่ ---
        await redisClient.del(`messages:${userId}`);

        return res.status(200).json({
            question: question,
            answer: answer,
            userMessage: userMessage,
            assistantMessage: assistantMessage,
            groupId: finalGroupId
        });

    } catch (error) {
        console.error("Chat error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

//ตอนสร้าง Group
router.post("/", verifyToken, async (req: AuthRequest, res) => {
    try {
        const { role, context } = req.body;

        if (!role || !context) {
            return res.status(400).json({
                error: "role and context are required"
            });
        }

        const userId = req.user!.userId;

        const message = await createMessage(userId, role, context);

        // --- เพิ่ม Redis: ลบ Cache เมื่อมีการสร้างข้อความใหม่ ---
        await redisClient.del(`messages:${userId}`);

        return res.status(201).json({
            message: "Message saved successfully",
            data: message
        });

    } catch (error) {
        console.error("Create message error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

//ตอนดึงข้อมูล
router.get("/", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const cacheKey = `messages:${userId}`;

        // 1. ลองเช็คใน Cache ก่อน
        const cachedMessages = await redisClient.get(cacheKey);

        if (cachedMessages) {
            console.log("🟢 ดึงข้อมูล Messages จาก Redis Cache");
            return res.status(200).json({
                data: JSON.parse(cachedMessages)
            });
        }

        // 2. ถ้าไม่มีใน Cache ให้ดึงจาก Database
        console.log("🔴 ดึงข้อมูล Messages จาก Database");
        const messages = await getMessagesByUserId(userId);

        // 3. เอาข้อมูลไปเก็บลง Cache ให้หมดอายุใน 1 ชั่วโมง
        if (messages) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(messages));
        }

        return res.status(200).json({
            data: messages
        });

    } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

//ตอนลบข้อมูล
router.delete("/", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;

        await deleteMessagesByUserId(userId);

        // --- เพิ่ม Redis: ลบ Cache เมื่อมีการลบข้อความ ---
        await redisClient.del(`messages:${userId}`);

        return res.status(200).json({
            message: "Chat history cleared successfully"
        });

    } catch (error) {
        console.error("Delete messages error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

//ตอนลบ Group
router.delete("/group/:groupId", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const groupId = req.params.groupId as string;

        if (!groupId) {
            return res.status(400).json({ error: "Group ID is required" });
        }

        const id = parseInt(groupId, 10);
        await deleteGroupById(id);

        // --- เพิ่ม Redis: ลบ Cache เมื่อมีการลบข้อมูลกลุ่มและข้อความ ---
        await redisClient.del(`messages:${userId}`);

        return res.status(200).json({
            message: "Group and its messages deleted successfully"
        });

    } catch (error) {
        console.error("Delete group error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default router;
