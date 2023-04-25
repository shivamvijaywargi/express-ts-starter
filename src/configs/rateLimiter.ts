import rateLimit from 'express-rate-limit';

import Logger from '@/utils/logger';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    message:
      'Too many requests from this IP address, please try again after 15 minutes.',
  },
  handler: (req, res, _next, options) => {
    Logger.error(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    );
    res.status(options.statusCode).json({
      success: false,
      message: options.message.message,
    });
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 1,
  message: {
    message:
      'Too many login attempts from this IP address, please try again after 30 minutes',
  },
  handler: (req, res, _next, options) => {
    Logger.error(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}\tIP: ${req.ip}`,
    );
    res.status(options.statusCode).json({
      success: false,
      message: options.message.message,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  message: {
    message:
      'Too many signup attempts from this IP address, please try again after 1 hour',
  },
  handler: (req, res, _next, options) => {
    Logger.error(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}\tIP: ${req.ip}`,
    );
    res.status(options.statusCode).json({
      success: false,
      message: options.message.message,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
