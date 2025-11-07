import { Hono } from 'hono';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const auth = new Hono<{ Bindings: Bindings }>();

// サインアップ
auth.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // バリデーション
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // メールアドレスの簡単な検証
    if (!email.includes('@')) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    // パスワードの長さ検証（最低6文字）
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // 既存ユーザーチェック
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400);
    }

    // パスワードをハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザーを作成
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, name || null).run();

    const userId = result.meta.last_row_id;

    // JWTトークンを生成
    const token = await generateToken(userId, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: userId,
        email,
        name: name || null,
      },
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ログイン
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // バリデーション
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // ユーザーを取得
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?'
    ).bind(email).first() as any;

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // パスワードを検証
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // JWTトークンを生成
    const token = await generateToken(user.id, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 現在のユーザー情報取得（認証必須）
auth.get('/me', async (c) => {
  try {
    const userId = c.get('userId');

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, created_at FROM users WHERE id = ?'
    ).bind(userId).first() as any;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;
