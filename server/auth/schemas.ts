import { z } from '@hono/zod-openapi';
import { ERRORS } from './validation';

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string()
}).openapi('User');

export const RegisterRequestSchema = z.object({
  username: z.string()
    .min(3, { message: ERRORS.USERNAME_TOO_SHORT })
    .max(30, { message: ERRORS.USERNAME_TOO_LONG })
    .refine(s => !/\s/.test(s), { message: ERRORS.USERNAME_HAS_SPACES }),
  password: z.string()
    .min(8, { message: ERRORS.PASSWORD_TOO_SHORT })
}).openapi('RegisterRequest');

export const LoginRequestSchema = z.object({
  username: z.string().min(1, { message: ERRORS.MISSING_FIELDS }),
  password: z.string().min(1, { message: ERRORS.MISSING_FIELDS })
}).openapi('LoginRequest');

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, { message: ERRORS.INVALID_TOKEN })
}).openapi('RefreshRequest');

export const LogoutRequestSchema = z.object({
  refreshToken: z.string().optional()
}).openapi('LogoutRequest');

export const TokenPairResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema
}).openapi('TokenPairResponse');

export const AccessTokenResponseSchema = z.object({
  accessToken: z.string()
}).openapi('AccessTokenResponse');

export const ErrorResponseSchema = z.object({
  error: z.string()
}).openapi('ErrorResponse');
