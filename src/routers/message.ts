import express from "express";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import {
    createMessage,
    getMessagesByUserId,
    deleteMessagesByUserId,
    createGroup,
    deleteGroupById
} from "../controllers/message";

const router = express.Router();


router.post("/chat", verifyToken, async (req: AuthRequest, res) => {
    try {
        const { question, groupId } = req.body;

        if (!question) {
            return res.status(400).json({ error: "question is required" });
        }

        const userId = req.user!.userId;
        let finalGroupId = groupId ? parseInt(groupId, 10) : null;

        // If no groupId was provided, we create a new group FIRST
        if (!finalGroupId) {
            const groupName = question.length > 40 ? question.slice(0, 40) + "..." : question;
            const newGroup = await createGroup(groupName);
            finalGroupId = newGroup.group_id as number;
        }

        // 1. Save user question
        const userMessage = await createMessage(userId, "user", question, finalGroupId);

        // 2. Ask AI
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

        // 3. Save AI answer
        const assistantMessage = await createMessage(userId, "assistant", answer, finalGroupId);

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


router.get("/", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;

        const messages = await getMessagesByUserId(userId);

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


router.delete("/", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;

        await deleteMessagesByUserId(userId);

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

router.delete("/group/:groupId", verifyToken, async (req: AuthRequest, res) => {
    try {
        const groupId = req.params.groupId as string;
        if (!groupId) {
            return res.status(400).json({ error: "Group ID is required" });
        }

        const id = parseInt(groupId, 10);
        await deleteGroupById(id);

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
