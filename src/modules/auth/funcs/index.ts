import { HttpException } from '@nestjs/common';
import { Request } from 'express';

import * as bcrypt from 'bcrypt';

import { generateFailedResponse, generateSuccessResponse } from '../utils';

import { UserEntity } from '@entities/user.entity';

import { ConfigurationService } from '@modules/shared/services/configuration/configuration.service';
import { UserService } from '@modules/user/services/user.service';
import { AuthService } from '../services/auth.service';

import { HandlerException } from '@exceptions/handler-exception';

import { RegisterDto } from '../dtos/register.dto';

import { validateAccount } from '../validations';

import { Configuration } from '@modules/shared/constants/configuration.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import { SERVER_EXIT_CODE } from '@constants/enums/error-code.enum';
export const createAccount = async (
  params: RegisterDto,
  auth_service: AuthService,
  configuration_service: ConfigurationService,
  user_service: UserService,
  req: Request,
) => {
  //#region Get params
  const { password, email } = params;
  //#endregion

  //#region Validation
  const valid = await validateAccount(email, auth_service, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  try {
    //#region Create user
    const salt = await configuration_service.get(Configuration.SALT);

    const hash = await bcrypt.hash(password, parseInt(salt));
    let user = new UserEntity();
    user.email = email;
    user.password = hash;

    user = await user_service.add(user);

    if (user) {
      //#region response
      return await generateSuccessResponse(user, null, req);
      //#endregion
    }
    //#endregion

    throw generateFailedResponse(req, ErrorMessage.OPERATOR_USER_ERROR);
  } catch (err) {
    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  }
};
