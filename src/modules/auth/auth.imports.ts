import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogModule } from '@modules/log/log.module';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';

import { SessionEntity } from '@entities/session.entity';
import { UserEntity } from '@entities/user.entity';

import { AuthController } from './controllers/auth.controller';

import { AuthService } from './services/auth.service';
import { ConfigurationService } from '@modules/shared/services/configuration/configuration.service';

import { jwtFactory } from '@factories/jwt.factory';

import { JwtStrategy } from './strategy/jwt';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([SessionEntity, UserEntity]),
  JwtModule.registerAsync({
    imports: [SharedModule],
    inject: [ConfigurationService],
    useFactory: jwtFactory,
  }),
  PassportModule,
  LogModule,
  UserModule,
];

export const controllers = [AuthController];
export const providers = [AuthService, JwtStrategy];
export const exporteds = [AuthService];
