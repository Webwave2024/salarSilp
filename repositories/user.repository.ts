import pool from '@/lib/db';
import type { User } from '@/types/user';

export async function findUserByUserId(userId: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createUser(data: {
  user_id: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE';
}): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (user_id, password, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.user_id, data.password, data.role]
  );
  return result.rows[0];
}

export async function userIdExists(userId: string): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM users WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].count) > 0;
}

export async function updateUserPassword(id: string, password: string): Promise<void> {
  await pool.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [password, id]
  );
}
