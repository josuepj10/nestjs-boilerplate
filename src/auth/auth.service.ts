import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload-interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  //Inject the User repository for use the entity
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService, //Inject the JWT service from the nestjs/jwt library. It was configured in the auth.module.ts with the JWT_SECRET and the expiresIn
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto; //Get the password from the DTO

      //Prepare the user for insert
      const user = this.userRepository.create({
        ...userData, //Get the user data
        password: bcrypt.hashSync(password, 10), //Hash the password
      });

      await this.userRepository.save(user); //Save the user in the database

      delete user.password; //Delete the password from the user object

      return {
        ...user, //Return the user
        token: this.getJwtToke({ id: user.id }), //Return the JWT token
      };
    } catch (error) {
      console.log(error);
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto; //Get the email and password from the DTO

    const user = await this.userRepository.findOne({
      where: { email }, //Find the user by email
      select: { email: true, password: true, id: true }, //Select the data that we need with the true value
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email'); //If the user is not found, throw an exception
    }

    if (!bcrypt.compareSync(password, user.password)) {
      //Compare the entered password with the user password
      throw new UnauthorizedException('Invalid password'); //If the user is not found, throw an exception
    }

    //console.log({ user });
    return {
      ...user, //Return the user
      token: this.getJwtToke({ id: user.id }), //Return the JWT token
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user, //Return the user
      token: this.getJwtToke({ id: user.id }), //Return the JWT token
    };
  }

  //Generate the JWT token
  private getJwtToke(payload: JwtPayload) {
    const token = this.jwtService.sign(payload); //Create the JWT token with the payload
    return token; //Return the token
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    } else {
      throw new InternalServerErrorException('Please check server logs');
    }
  }
}
