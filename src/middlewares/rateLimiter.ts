import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10000, // Limit each IP to 10000 requests per `window` (here, per 5 minutes)
});
