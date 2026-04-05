import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';
import dotenv from "dotenv";
dotenv.config();

export function generateAccessToken(userId: string) {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return token;
}

export function generateRefreshToken(userId: string, accessToken: string) {
    const token = jwt.sign({ userId, accessToken }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    return token;
}

interface DecodedToken {
    userId: string;
    accessToken?: string;
    iat?: number;
    exp?: number;
}

export function decodedToken(token: string): DecodedToken {
    return jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
}

export async function deleteRefreshToken(refreshToken: string) {
    const { data, error } = await supabase
        .from('auth_token')
        .delete()
        .eq('refresh_token', refreshToken);
    console.log(refreshToken)
    if (error) throw error;
    return data;
}

export async function storeToken(userId: string, refreshToken: string) {
    const { data, error } = await supabase
        .from('auth_token')
        .insert([{ user_id: userId, refresh_token: refreshToken }])
        .select();
    if (error) throw error;
    return data;
}

export async function updateToken(refreshToken: string, newRefreshToken: string) {
    const { data, error } = await supabase
        .from('auth_token')
        .update({ refresh_token: newRefreshToken })
        .eq('refresh_token', refreshToken)
        .select();
    if (error) throw error;
    return data;
}

export async function checkToken(refreshToken: string) {
    const { data, error } = await supabase
        .from('auth_token')
        .select()
        .eq('refresh_token', refreshToken);
    if (error) throw error;
    return data;
}