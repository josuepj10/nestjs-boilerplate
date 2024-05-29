import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  //This constructor use Reflector to get information and metadata from the decorators/controllers
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    ); //Get the roles from the metadata
    //console.log({ validRoles });

    if (!validRoles) return true; //If there are no roles, return true, anyone can access
    if ( validRoles.length === 0 ) return true; //If there are no roles, return true, anyone can access 

    const request = context.switchToHttp().getRequest(); //Allow get to the data from the http request (the user authenticated)
    const user = request.user; //Get the user data from the request object

    if (!user) throw new BadRequestException('User not found');

    //console.log({ userRoles: user.roles });

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} does not have a valid role to access. Valid roles: ${validRoles}`,
    );
  }
}
