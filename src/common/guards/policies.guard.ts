import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const POLICIES_KEY = 'policies';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPolicies = this.reflector.getAllAndOverride<string[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPolicies) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredPolicies.every((policy) => this.validatePolicy(user, policy));
  }

  private validatePolicy(user: any, policy: string): boolean {
    // Implement your policy validation logic here
    return user.policies?.includes(policy);
  }
} 