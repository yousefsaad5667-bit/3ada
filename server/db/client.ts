import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const createDb = (d1: D1Database) => drizzle(d1, { schema });

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;
export type RefreshToken = InferSelectModel<typeof schema.refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof schema.refreshTokens>;
export type RelapseRecord = InferSelectModel<typeof schema.relapseRecords>;
export type NewRelapseRecord = InferInsertModel<typeof schema.relapseRecords>;
export type UserSettings = InferSelectModel<typeof schema.userSettings>;
export type NewUserSettings = InferInsertModel<typeof schema.userSettings>;
