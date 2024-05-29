import { PassportStrategy } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload-interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'process';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'), //Access the environment variable JWT_SECRET
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Extract the JWT from the Authorization header
    });
  }

  //Payload contains the user data that was encoded in the JWT
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload; //Extract the email from the payload

    const user = await this.userRepository.findOneBy({ id }); //Find the user by email

    if (!user) {
      throw new UnauthorizedException('Not valid token');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User is not active, please contact the administrator',
      );
    }

    //console.log({ user });

    return user;
  }
}
