import { Request as ExpressRequest } from 'express';
import { UserRoleEnum } from '@/entities/enums/user.enum';

export interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: UserRoleEnum;
    companyId: string;
  };
}
