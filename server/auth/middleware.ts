import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import { ERRORS } from './validation';
import type { Env, Variables } from '../types';
import type { JwtPayload } from './types';

export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: ERRORS.UNAUTHORIZED }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256') as unknown as JwtPayload;
    c.set('userId', payload.sub);
    return await next();
  } catch {
    return c.json({ error: ERRORS.UNAUTHORIZED }, 401);
  }
};
