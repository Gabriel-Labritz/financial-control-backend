import { Module } from '@nestjs/common';
import { HashingProtocol } from './hashing/hashing-protocol';
import { HashingService } from './hashing/hashing.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/User';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    { provide: HashingProtocol, useClass: HashingService },
    AuthService,
  ],
  controllers: [AuthController],
  exports: [HashingProtocol, JwtModule, ConfigModule],
})
export class AuthModule {}
