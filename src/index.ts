import express from 'express';
import cookieParser from 'cookie-parser';
import type { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import healthRouter from './health';
import createUserRouter from './routers/create-user';
import loginRouter from './routers/login';
import refreshTokenRouter from './routers/refresh-token';
import checkGmailRouter from './routers/check-gmail';
import getUserRouter from './routers/get-user';
import logoutRouter from './routers/logout';

dotenv.config();
//Setup Express
const app: Application = express();
const PORT = process.env.PORT;

//Setup Environment
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

//Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Router
app.use('/health', healthRouter);
app.use('/create-user', createUserRouter);
app.use('/login', loginRouter);
app.use('/refresh-token', refreshTokenRouter);
app.use('/check-gmail', checkGmailRouter);
app.use('/logout', logoutRouter);
app.use('/get-user', getUserRouter);

//Run Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});