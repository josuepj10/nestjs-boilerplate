import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { RawHeaders, GetUser, RoleProtected, Auth } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth') // This decorator is used to group the endpoints in the Swagger UI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(    
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user ); //User
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    //console.log( request )
    return {
      ok: true,
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
    };
  }

  // @SetMetadata('roles', ['admin','super-user'])
  @RoleProtected(ValidRoles.admin)
  @Get('private2')
  @UseGuards(AuthGuard(), UserRoleGuard) //AuthGuard is authentication and UserRoleGuard is authorization
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  //Decorator composition: in the case private2, you use multiple decorators to set the metadata and the guards, but in private3, you use only one decorator to do the same thing.
  @Get('private3')
  @Auth(ValidRoles.admin) //The user must be authenticated and have the role of admin
 // @Auth() //The user must be authenticated
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
 