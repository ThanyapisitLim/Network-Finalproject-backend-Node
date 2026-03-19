import express from 'express';
import type { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import healthRouter from './health';

dotenv.config();
//Setup Express
const app: Application = express();
const PORT = process.env.PORT;

//Setup Environment
app.use(cors());
app.use(express.json());

//Router
app.use('/health', healthRouter);

//Run Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});