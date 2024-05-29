import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';

export const META_ROLES = 'roles'; //Define the metadata string only in one place

export const RoleProtected = (...args: ValidRoles[]) => {


  return SetMetadata( META_ROLES, args );
}
