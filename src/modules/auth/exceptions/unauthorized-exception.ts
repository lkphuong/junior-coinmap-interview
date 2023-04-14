import { HttpException, HttpStatus } from '@nestjs/common';

import { LogService } from '@modules/log/services/log.service';
import { Levels } from '@constants/enums/level.enum';

export class UnauthorizedException extends HttpException {
  private _logger = new LogService();

  constructor(
    token: string,
    errorCode?: number,
    method?: string,
    path?: string,
    message?: string,
    status?: HttpStatus,
  ) {
    super(
      {
        errorCode: errorCode ?? 0,
        message: message ?? `Unauthorized (token: ${token}).`,
      },
      status || HttpStatus.UNAUTHORIZED,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? `Unauthorized (token: ${token}).`,
    );
  }
}
