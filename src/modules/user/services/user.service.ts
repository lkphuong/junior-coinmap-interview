import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { UserEntity } from '@entities/user.entity';

import { LogService } from '@modules/log/services/log.service';
import { Levels } from '@constants/enums/level.enum';
import { Methods } from '@constants/enums/method.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}
  async add(
    user: UserEntity,
    manager?: EntityManager,
  ): Promise<UserEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      user = await manager.save(user);

      return user || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'UserService.add()',
        e,
      );
      return null;
    }
  }

  async active(user: UserEntity): Promise<boolean> {
    try {
      const result = await this._dataSource.manager.update(
        UserEntity,
        { id: user.id },
        { active: true },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'UserService.active()',
        e,
      );
      return null;
    }
  }
}
