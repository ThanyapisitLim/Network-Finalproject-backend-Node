import express from 'express';
import type { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import healthRouter from './health';
import createUserRouter from './routers/create-user';
import loginRouter from './routers/login';
import refreshTokenRouter from './routers/refresh-token';

dotenv.config();
//Setup Express
const app: Application = express();
const PORT = process.env.PORT;

//Setup Environment
app.use(cors());
app.use(express.json());

//Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Router
app.use('/health', healthRouter);
app.use('/create-user', createUserRouter);
app.use('/login', loginRouter);
app.use('/refresh-token', refreshTokenRouter);

//Run Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});