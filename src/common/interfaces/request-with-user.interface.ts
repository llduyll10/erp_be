import { Request } from 'express';
import { UserRole } from '@/entities/users.entity';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    companyId: string;
  };
}
