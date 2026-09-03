export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
