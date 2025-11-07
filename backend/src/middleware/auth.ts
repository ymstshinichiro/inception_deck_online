import { Context, Next } from 'hono';
import { verifyToken } from '../utils/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

// 認証が必要なルートに適用するミドルウェア
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7); // "Bearer " を除去
  const payload = await verifyToken(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // コンテキストにuserIdを保存
  c.set('userId', payload.userId);
  await next();
}
