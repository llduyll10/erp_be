import { UserRole } from '@/entities/users.entity';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  company_id: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}
