import { Context, Next } from 'hono';

export const loggerMiddleware = async (c: Context, next: Next) => {
  await next();
  console.log(
    JSON.stringify({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
    })
  );
};
