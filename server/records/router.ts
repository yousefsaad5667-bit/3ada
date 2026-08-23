import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { Env, Variables } from '../types';
import { authMiddleware } from '../auth/middleware';
import { RecordService } from './service';
import { RECORD_ERRORS } from './errors';
import {
  RecordSchema,
  CreateRecordRequestSchema,
  UpdateRecordRequestSchema,
  ErrorResponseSchema,
  RecordsResponseSchema,
} from './schemas';

export const recordsRouter = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

recordsRouter.use('*', authMiddleware);

const postCreateRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: { 'application/json': { schema: CreateRecordRequestSchema } }
    }
  },
  responses: {
    201: {
      content: { 'application/json': { schema: RecordSchema } },
      description: 'Record created'
    },
    422: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Validation error'
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error'
    }
  }
});

recordsRouter.openapi(postCreateRoute, async (c) => {
  try {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    const service = new RecordService(c.env.DB);
    const record = await service.create(userId, data);
    return c.json(record, 201);
  } catch (error) {
    console.error('Create record error:', error);
    return c.json({ error: RECORD_ERRORS.INTERNAL_ERROR }, 500);
  }
});

const getListRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).openapi({ description: 'Date range filters' })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: RecordsResponseSchema } },
      description: 'List of records'
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error'
    }
  }
});

recordsRouter.openapi(getListRoute, async (c) => {
  try {
    const userId = c.get('userId');
    const { from, to } = c.req.query();
    const service = new RecordService(c.env.DB);
    const records = await service.getAll(userId, from, to);
    return c.json(records, 200);
  } catch (error) {
    console.error('List records error:', error);
    return c.json({ error: RECORD_ERRORS.INTERNAL_ERROR }, 500);
  }
});

const getByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: RecordSchema } },
      description: 'Record found'
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Record not found'
    },
    403: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Forbidden'
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error'
    }
  }
});

recordsRouter.openapi(getByIdRoute, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.valid('param');
    const service = new RecordService(c.env.DB);
    const record = await service.findById(id);
    if (!record) {
      return c.json({ error: RECORD_ERRORS.RECORD_NOT_FOUND }, 404);
    }
    if (record.userId !== userId) {
      return c.json({ error: RECORD_ERRORS.FORBIDDEN }, 403);
    }
    return c.json(record, 200);
  } catch (error) {
    console.error('Get record error:', error);
    return c.json({ error: RECORD_ERRORS.INTERNAL_ERROR }, 500);
  }
});

const putUpdateRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid()
    }),
    body: {
      content: { 'application/json': { schema: UpdateRecordRequestSchema } }
    }
  },
  responses: {
    200: {
      content: { 'application/json': { schema: RecordSchema } },
      description: 'Record updated'
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Record not found'
    },
    403: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Forbidden'
    },
    422: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Validation error'
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error'
    }
  }
});

recordsRouter.openapi(putUpdateRoute, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const service = new RecordService(c.env.DB);
    const existing = await service.findById(id);
    if (!existing) {
      return c.json({ error: RECORD_ERRORS.RECORD_NOT_FOUND }, 404);
    }
    if (existing.userId !== userId) {
      return c.json({ error: RECORD_ERRORS.FORBIDDEN }, 403);
    }
    const updated = await service.update(userId, id, data);
    return c.json(updated!, 200);
  } catch (error) {
    console.error('Update record error:', error);
    return c.json({ error: RECORD_ERRORS.INTERNAL_ERROR }, 500);
  }
});

const deleteByIdRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },
  responses: {
    204: {
      description: 'Record deleted'
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Record not found'
    },
    403: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Forbidden'
    },
    500: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'Internal server error'
    }
  }
});

recordsRouter.openapi(deleteByIdRoute, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.valid('param');
    const service = new RecordService(c.env.DB);
    const existing = await service.findById(id);
    if (!existing) {
      return c.json({ error: RECORD_ERRORS.RECORD_NOT_FOUND }, 404);
    }
    if (existing.userId !== userId) {
      return c.json({ error: RECORD_ERRORS.FORBIDDEN }, 403);
    }
    await service.delete(userId, id);
    return c.body(null, 204);
  } catch (error) {
    console.error('Delete record error:', error);
    return c.json({ error: RECORD_ERRORS.INTERNAL_ERROR }, 500);
  }
});