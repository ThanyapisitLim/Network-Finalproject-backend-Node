import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
    userId: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: DecodedToken;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET!
        ) as DecodedToken;

        req.user = decoded;

        next();

    } catch (error: any) {

        if (error.name === "TokenExpiredError") {
            console.log("Token expired");
            return res.status(401).json({
                error: "Token expired"
            });
        }

        if (error.name === "JsonWebTokenError") {
            console.log("Invalid token");
            return res.status(401).json({
                error: "Invalid token"
            });
        }

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}