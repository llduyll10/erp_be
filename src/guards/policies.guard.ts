import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  IPolicyClass,
  POLICY_KEY,
  ACTION_KEY,
  RESOURCE_ENTITY_KEY,
} from '@/decorators/policy.decorator';
import { DataSource } from 'typeorm';
import { DEFAULT_ACTIONS } from '@/constants/index';
import { isUUID } from 'class-validator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly dataSource: DataSource,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext) {
    const PolicyClass = this.reflector.getAllAndOverride<IPolicyClass>(
      POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    const action = this.reflector.getAllAndOverride<string>(ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const resourceClass = this.reflector.getAllAndOverride<string>(
      RESOURCE_ENTITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!PolicyClass || !action || !resourceClass) return true;

    const policy = new PolicyClass();

    const { user, params } = context.switchToHttp().getRequest();

    policy.setUser(user);

    if (action === DEFAULT_ACTIONS.FILTER) return policy.authorize(action);

    const id = params?.id;
    if (id && !isUUID(id, '4')) {
      throw new BadRequestException('Invalid id');
    }
    const resource = await this.dataSource
      .getRepository(resourceClass)
      .findOneBy({ id: params?.id });

    // Resource service will handle not found exception
    if (!resource) return true;

    return policy.authorize(action, resource);
  }
}
