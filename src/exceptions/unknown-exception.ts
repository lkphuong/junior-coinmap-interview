import { HttpException, HttpStatus } from '@nestjs/common';

import { LogService } from '@modules/log/services/log.service';

import { DATABASE_EXIT_CODE } from '@constants/enums/error-code.enum';
import { Levels } from '@constants/enums/level.enum';

export class UnknownException extends HttpException {
  private _logger = new LogService();

  constructor(
    id: number | string,
    errorCode?: number,
    method?: string,
    path?: string,
    message?: string,
    status?: HttpStatus,
  ) {
    super(
      {
        errorCode: errorCode ?? DATABASE_EXIT_CODE.UNKNOW_VALUE,
        message: message ?? `Not Found (id: ${id}).`,
      },
      status || HttpStatus.NOT_FOUND,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? `Not Found (id: ${id}).`,
    );
  }
}
