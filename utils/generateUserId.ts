import { userIdExists } from '@/repositories/user.repository';

const PREFIX = 'WEBWAVE-';
const DIGITS = 5;
const MAX_RETRIES = 10;

/**
 * Generates a unique WEBWAVE-XXXXX user ID.
 * Retries on collision up to MAX_RETRIES times.
 */
export async function generateUserId(): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const num = Math.floor(10000 + Math.random() * 90000); // 10000–99999
    const userId = `${PREFIX}${num}`;
    const exists = await userIdExists(userId);
    if (!exists) return userId;
  }
  throw new Error('Failed to generate a unique User ID after maximum retries.');
}

export function isValidWebwaveUserId(userId: string): boolean {
  return /^WEBWAVE-\d{5}$/.test(userId) || userId === 'WEBWAVE-ADMIN';
}
