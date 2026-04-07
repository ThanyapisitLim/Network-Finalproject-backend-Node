import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// สร้าง Redis Client โดยดึง URL มาจาก .env
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// ดักจับ Event ต่างๆ เพื่อดูสถานะการเชื่อมต่อ
redisClient.on('connect', () => {
    console.log('✅ กำลังเชื่อมต่อกับ Redis...');
});

redisClient.on('ready', () => {
    console.log('🚀 เชื่อมต่อ Redis สำเร็จพร้อมใช้งาน!');
});

redisClient.on('error', (err) => {
    console.error('❌ เกิดข้อผิดพลาดกับ Redis:', err);
});

redisClient.on('end', () => {
    console.log('⚠️ ตัดการเชื่อมต่อกับ Redis แล้ว');
});

// ฟังก์ชันสำหรับ Connect ที่จะถูกเรียกตอน Start Server
export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('ไม่สามารถเชื่อมต่อ Redis ได้:', err);
    }
};

export default redisClient;
