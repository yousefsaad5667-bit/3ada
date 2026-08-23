import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { ERRORS } from './validation';
import { hashPassword, generateAccessToken, generateRefreshToken, hashToken, verifyPassword } from './crypto';
import type { Env, Variables } from '../types';
import { createDb } from '../db/client';
import { users, refreshTokens } from '../db/schema';
import { 
  RegisterRequestSchema, LoginRequestSchema, RefreshRequestSchema, LogoutRequestSchema,
  TokenPairResponseSchema, AccessTokenResponseSchema, ErrorResponseSchema
} from './schemas';
import { authMiddleware } from './middleware';

export const authRouter = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

const hook = (result: any, c: any) => {
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || ERRORS.MISSING_FIELDS;
    return c.json({ error: firstError }, 422);
  }
};

const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: { 'application/json': { schema: RegisterRequestSchema } }
    }
  },
  responses: {
    201: {
      content: { 'application/json': { schema: TokenPairResponseSchema } },
      description: 'User registered'
    },
    422: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Validation error'
    },
    409: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Username taken'
    }
  }
});

authRouter.openapi(registerRoute, async (c) => {
  const { username, password } = c.req.valid('json');
  const db = createDb(c.env.DB);
  
  const existingUser = await db.select().from(users).where(eq(users.username, username)).get();
  if (existingUser) {
    return c.json({ error: ERRORS.USERNAME_TAKEN }, 409);
  }
  
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();
  const nowStr = new Date().toISOString();
  
  await db.insert(users).values({
    id: userId,
    username,
    passwordHash: passwordHash,
    createdAt: nowStr,
  });
  
  const refreshToken = generateRefreshToken();
  const tokenHash = await hashToken(refreshToken);
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  await db.insert(refreshTokens).values({
    id: tokenId,
    userId: userId,
    tokenHash: tokenHash,
    expiresAt: expiresAt.toISOString(),
    createdAt: nowStr,
  });
  
  const accessToken = await generateAccessToken(userId, c.env.JWT_SECRET);
  
  return c.json({
    accessToken,
    refreshToken,
    user: { id: userId, username }
  }, 201);
}, hook);

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: { content: { 'application/json': { schema: LoginRequestSchema } } }
  },
  responses: {
    200: { content: { 'application/json': { schema: TokenPairResponseSchema } }, description: 'Logged in' },
    422: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Validation error' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Invalid credentials' }
  }
});

authRouter.openapi(loginRoute, async (c) => {
  const { username, password } = c.req.valid('json');
  const db = createDb(c.env.DB);
  const user = await db.select().from(users).where(eq(users.username, username)).get();

  if (!user) {
    await hashPassword('dummy_for_timing');
    return c.json({ error: ERRORS.INVALID_CREDENTIALS }, 401);
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: ERRORS.INVALID_CREDENTIALS }, 401);
  }

  const refreshToken = generateRefreshToken();
  const tokenHash = await hashToken(refreshToken);
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const nowStr = new Date().toISOString();

  await db.insert(refreshTokens).values({
    id: tokenId,
    userId: user.id,
    tokenHash: tokenHash,
    expiresAt: expiresAt.toISOString(),
    createdAt: nowStr,
  });

  const accessToken = await generateAccessToken(user.id, c.env.JWT_SECRET);

  return c.json({
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username }
  }, 200);
}, hook);

const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh',
  request: {
    body: { content: { 'application/json': { schema: RefreshRequestSchema } } }
  },
  responses: {
    200: { content: { 'application/json': { schema: AccessTokenResponseSchema } }, description: 'Token refreshed' },
    422: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Validation error' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Invalid token' }
  }
});

authRouter.openapi(refreshRoute, async (c) => {
  const { refreshToken } = c.req.valid('json');
  const tokenHash = await hashToken(refreshToken);
  const db = createDb(c.env.DB);
  
  const storedToken = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).get();
  if (!storedToken) {
    return c.json({ error: ERRORS.INVALID_TOKEN }, 401);
  }

  const expiresAt = new Date(storedToken.expiresAt).getTime();
  if (expiresAt < Date.now()) {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
    return c.json({ error: ERRORS.INVALID_TOKEN }, 401);
  }

  const user = await db.select().from(users).where(eq(users.id, storedToken.userId)).get();
  if (!user) {
    return c.json({ error: ERRORS.INVALID_TOKEN }, 401);
  }

  const accessToken = await generateAccessToken(user.id, c.env.JWT_SECRET);
  return c.json({ accessToken }, 200);
}, hook);

const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  request: {
    body: { content: { 'application/json': { schema: LogoutRequestSchema } } }
  },
  responses: {
    200: { description: 'Logged out' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Unauthorized' }
  }
});

authRouter.use('/logout', authMiddleware);
authRouter.openapi(logoutRoute, async (c) => {
  const { refreshToken } = c.req.valid('json');
  if (refreshToken) {
    const tokenHash = await hashToken(refreshToken);
    const db = createDb(c.env.DB);
    await db.delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }
  return c.json({}, 200);
});
