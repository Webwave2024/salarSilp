export interface User {
  id: string;
  user_id: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE';
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE';
