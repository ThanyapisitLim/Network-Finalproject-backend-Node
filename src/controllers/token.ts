import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';
import dotenv from "dotenv";
dotenv.config();

export function generateAccessToken(gmail: string) {
    const token = jwt.sign({ gmail }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return token;
}

export function generateRefreshToken(gmail: string, accessToken: string) {
    const token = jwt.sign({ gmail, accessToken }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    return token;
}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded;
    } catch (error) {
        throw error;
    }
}

export async function storeToken(userId: string, refreshToken: string) {
    const { data, error } = await supabase
        .from('auth_token')
        .insert([{ user_id: userId, refresh_token: refreshToken }])
        .select();
    if (error) throw error;
    return data;
}