import { cors } from 'hono/cors';

export const corsMiddleware = (origin: string) =>
  cors({
    origin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
