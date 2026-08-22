import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  JWT_SECRET: string;
}

export type Variables = {
  userId: string;
};
