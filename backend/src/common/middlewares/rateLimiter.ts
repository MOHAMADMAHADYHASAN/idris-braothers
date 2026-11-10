import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

export const appRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // Default: 15 minutes
  max: env.RATE_LIMIT_MAX, // Default: 2000 requests per 15 mins per IP
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});
