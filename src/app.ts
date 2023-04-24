import { config } from 'dotenv';
config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morganMiddleware from './configs/morgan';
import rateLimiter from './configs/rateLimiter';

const app = express();

// Middlewares
// Built-in
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Third-party
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(compression());
// Custom
app.use(morganMiddleware);
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}

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
import authRoutes from './routes/v1/auth.routes';

app.use('/api/v1/auth', authRoutes);

// CatchAll - 404 --- This should be after all the other routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.method} ${req.originalUrl}`,
  });
});

// Custom error middleware
// app.use(errorMiddleware);

export default app;
