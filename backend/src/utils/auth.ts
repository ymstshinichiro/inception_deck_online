import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// パスワードをハッシュ化
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// パスワードを検証
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWTトークンを生成
export async function generateToken(userId: number, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secretKey);

  return token;
}

// JWTトークンを検証
export async function verifyToken(token: string, secret: string): Promise<{ userId: number } | null> {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);

    const { payload } = await jwtVerify(token, secretKey);
    return { userId: payload.userId as number };
  } catch (error) {
    return null;
  }
}
