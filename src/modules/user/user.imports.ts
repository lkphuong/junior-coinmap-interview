import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@entities/user.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { UserService } from './services/user.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([UserEntity]),
  LogModule,
];

export const controllers = [];

export const providers = [UserService];

export const exporteds = [UserService];
