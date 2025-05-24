import { UserRoleEnum } from '@/entities/enums/user.enum';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRoleEnum;
  company_id: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}
