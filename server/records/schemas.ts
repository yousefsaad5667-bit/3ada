import { z } from '@hono/zod-openapi';
import { RECORD_ERRORS } from './errors';

export const RecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: RECORD_ERRORS.DATE_INVALID }),
  time: z.string().nullable(),
  ampm: z.string().nullable(),
  count: z.number().int().min(1, { message: RECORD_ERRORS.COUNT_INVALID }),
  urgeLevel: z.number().int().min(1, { message: RECORD_ERRORS.URGE_LEVEL_INVALID }).max(10, { message: RECORD_ERRORS.URGE_LEVEL_INVALID }).nullable(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('Record');

export const CreateRecordRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: RECORD_ERRORS.DATE_INVALID }),
  time: z.string().nullable().optional(),
  ampm: z.string().nullable().optional(),
  count: z.number().int().min(1, { message: RECORD_ERRORS.COUNT_INVALID }).default(1),
  urgeLevel: z.number().int().min(1, { message: RECORD_ERRORS.URGE_LEVEL_INVALID }).max(10, { message: RECORD_ERRORS.URGE_LEVEL_INVALID }).nullable().optional(),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
}).openapi('CreateRecordRequest');

export const UpdateRecordRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: RECORD_ERRORS.DATE_INVALID }).optional(),
  time: z.string().nullable().optional(),
  ampm: z.string().nullable().optional(),
  count: z.number().int().min(1, { message: RECORD_ERRORS.COUNT_INVALID }).optional(),
  urgeLevel: z.number().int().min(1, { message: RECORD_ERRORS.URGE_LEVEL_INVALID }).max(10, { message: RECORD_ERRORS.URGE_LEVEL_INVALID }).nullable().optional(),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
}).openapi('UpdateRecordRequest');

export const ErrorResponseSchema = z.object({
  error: z.string()
}).openapi('ErrorResponse');

export const RecordsResponseSchema = z.array(RecordSchema).openapi('RecordsResponse');