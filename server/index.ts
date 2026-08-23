import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';

import { authRouter } from './auth/router';
import { authMiddleware } from './auth/middleware';

const app = new OpenAPIHono<{ Bindings: Env }>().basePath('/api');

app.use('*', (c, next) => corsMiddleware(c.env.ALLOWED_ORIGIN)(c, next));
app.use('*', loggerMiddleware);

app.route('/auth', authRouter);

app.get('/health', (c) => c.json({ status: 'ok' }));

// TODO: Replace with real user profile route in Phase 6
app.get('/me', authMiddleware, (c) => c.json({ userId: c.get('userId') }));

// OpenAPI Documentation
app.doc('/doc', {
  info: {
    title: 'Habit Tracker API',
    version: 'v1'
  },
  openapi: '3.1.0'
});
app.get('/swagger', swaggerUI({ url: '/api/doc' }));

app.onError((err, c) => {
  console.error(JSON.stringify({ error: err.stack, path: c.req.path }));
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
