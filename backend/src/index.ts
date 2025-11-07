import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import decks from './routes/decks';
import items from './routes/items';
import { authMiddleware } from './middleware/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS設定
app.use('/*', cors({
  origin: ['http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ヘルスチェック
app.get('/', (c) => {
  return c.json({ message: 'Inception Deck API is running!' });
});

// 認証ルート（signup, loginは認証不要）
app.route('/api/auth', auth);

// /api/auth/me だけ認証が必要
app.use('/api/auth/me', authMiddleware);

// 保護されたルート（認証必須）
app.use('/api/decks/*', authMiddleware);
app.route('/api/decks', decks);
app.route('/api/decks', items);

export default app;
