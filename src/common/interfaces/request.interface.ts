import { Request as ExpressRequest } from 'express';
import { UserRole } from '@/entities/users.entity';

export interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    companyId: string;
  };
}
