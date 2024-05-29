import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [

    ConfigModule, //Import ConfigModule to use the ConfigService to access the environment variable in jwt.strategy.ts

    TypeOrmModule.forFeature([User]),

    PassportModule.register({ defaultStrategy: 'jwt' }), //Import PassportModule and register the default strategy as JsonWebToken

    JwtModule.registerAsync({
      imports: [ConfigModule], //ConfigModule provides ConfigService, allow the access to the environment variable
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log('JTW SECRET Service', configService.get('JWT_SECRET')); //Call the JWT_SECRET from the environment variable using the ConfigService
        //  console.log('JTW SECRET', process.env.JWT_SECRET) //Call the JWT_SECRET from the environment variable ( No used in this case, but it is another way to call the environment variable)
        return {
          secret: configService.get('JWT_SECRET'), //Secret key for the JWT (Nobody should know this key except the server)
          signOptions: { expiresIn: '2h' },
        };
      },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
