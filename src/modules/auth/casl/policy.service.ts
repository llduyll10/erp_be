import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/users.entity';
import { Company } from '@/entities/companies.entity';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Action } from '@/common/enums/action.enum';
import { UserRoleEnum } from '@/entities/enums/user.enum';
// Define subject types as the classes themselves, not string literals
export type Subjects = InferSubjects<typeof User | typeof Company> | 'all';

// Fix the AppAbility type definition
export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.role === UserRoleEnum.ADMIN) {
      // Admin can manage all resources within their company
      can(Action.Manage, 'all');
    } else if (user.role === UserRoleEnum.SALES) {
      // Sales can read all users from their company
      can(Action.Read, User);

      // Sales can read their own company
      can(Action.Read, Company);

      // Sales can update their own user
      can(Action.Update, User);
    } else {
      // Default role (WAREHOUSE)
      can(Action.Read, User);
      can(Action.Update, User);
      can(Action.Read, Company);
    }

    // No one can delete their own company
    cannot(Action.Delete, Company);

    return build({
      detectSubjectType: (item) => {
        // Return the class of the item
        if (item instanceof User) return User;
        if (item instanceof Company) return Company;
        return item as ExtractSubjectType<Subjects>;
      },
    });
  }
}
