import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

import { sprintf } from '@utils/index';

import { AuthService } from '../services/auth.service';

import { HandlerException } from '@exceptions/handler-exception';

import { ErrorMessage } from '../constants/enums/errors.enum';
import { VALIDATION_EXIT_CODE } from '@constants/enums/error-code.enum';
import { UserEntity } from '@entities/user.entity';

export const validateAccount = async (
  email: string,
  auth_service: AuthService,
  req: Request,
): Promise<HttpException | null | UserEntity> => {
  const user = await auth_service.getUserByEmail(email);

  if (user) {
    if (user.active) {
      return new HandlerException(
        VALIDATION_EXIT_CODE.UNIQUE_VALUE,
        req.method,
        req.url,
        sprintf(ErrorMessage.EMAIL_DUPLICATE_ERROR, email),
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  return null;
};
