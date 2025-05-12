import { Role } from '../../../constants/enums/role.enum';

export interface RequestUser {
  id: string;
  email: string;
  roles: Role[];
} 