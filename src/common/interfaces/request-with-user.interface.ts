import { Request } from 'express';
import { UserRoleEnum } from '@/entities/enums/user.enum';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRoleEnum;
    companyId: string;
  };
}
