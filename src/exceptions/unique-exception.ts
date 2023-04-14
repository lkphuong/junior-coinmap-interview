import { HttpException, HttpStatus } from '@nestjs/common';

import { LogService } from '@modules/log/services/log.service';

import { DATABASE_EXIT_CODE } from '@constants/enums/error-code.enum';
import { Levels } from '@constants/enums/level.enum';

export class UniqueException extends HttpException {
  private _logger = new LogService();

  constructor(
    code: string | number,
    errorCode?: number,
    method?: string,
    path?: string,
    message?: string,
    status?: HttpStatus,
  ) {
    super(
      {
        errorCode: errorCode ?? DATABASE_EXIT_CODE.UNIQUE_FIELD_VALUE,
        message: message ?? `Unique value (code: ${code}).`,
      },
      status || HttpStatus.AMBIGUOUS,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? `Unique value (code: ${code}).`,
    );
  }
}
