import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissions } from '@role/role-permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndMerge<string[]>(
      'permissions',
      [context.getClass(), context.getHandler()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRoles = request.user?.roles ?? [];

    let userPermissions = userRoles.flatMap(
      ({ name }: { name: string }) => RolePermissions[name] ?? [],
    );

    userPermissions = [...new Set(userPermissions)];

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new UnauthorizedException(
        'You do not have the permission to perform this action',
      );
    }

    return hasPermission;
  }
}
