import { config } from 'dotenv';
config();
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morganMiddleware from './configs/morgan';

const app = express();

// Middlewares
// Built-in
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Third-party
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL as string,
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(compression());
// Custom
// app.use(rateLimiter);
app.use(morganMiddleware);

/**
 * @SERVER_STATUS
 * @ROUTE @GET {{URL}}/api/ping
 * @DESC Returns response 200 with message pong if api is working
 * @ACCESS Public
 */
app.get('/api/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    message: 'PONG',
  });
});

// Import all routes

// CatchAll - 404
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.method} ${req.originalUrl}`,
  });
});

// Custom error middleware
// app.use(errorMiddleware);

export default app;
