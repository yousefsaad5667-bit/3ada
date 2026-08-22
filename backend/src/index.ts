import { Hono } from 'hono';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';

const app = new Hono<{ Bindings: Env }>();

app.use('*', (c, next) => corsMiddleware(c.env.ALLOWED_ORIGIN)(c, next));
app.use('*', loggerMiddleware);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.onError((err, c) => {
  console.error(JSON.stringify({ error: err.message, path: c.req.path }));
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
