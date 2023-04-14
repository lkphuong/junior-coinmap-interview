import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as jsonwebtoken from 'jsonwebtoken';

import { sprintf } from '@utils/index';
import { generateFailedResponse, generateSuccessResponse } from '../utils';

import { UserEntity } from '@entities/user.entity';

import { ConfigurationService } from '@modules/shared/services/configuration/configuration.service';
import { UserService } from '@modules/user/services/user.service';
import { AuthService } from '../services/auth.service';
import { LogService } from '@modules/log/services/log.service';

import { HandlerException } from '@exceptions/handler-exception';
import { InvalidTokenException } from '../exceptions/invalid-token-exception';

import { VerifyTokenResponse } from '../interfaces/auth_response.interface';

import { RegisterDto } from '../dtos/register.dto';

import { validateAccount } from '../validations';

import { Configuration } from '@modules/shared/constants/configuration.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  AUTHENTICATION_EXIT_CODE,
  SERVER_EXIT_CODE,
  UNKNOW_EXIT_CODE,
} from '@constants/enums/error-code.enum';

import { Levels } from '@constants/enums/level.enum';

export const createAccount = async (
  params: RegisterDto,
  auth_service: AuthService,
  configuration_service: ConfigurationService,
  user_service: UserService,
  jwt_service: JwtService,
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
    if (valid) {
      //#region send email
      await sendVerificationEmail(
        email,
        configuration_service,
        jwt_service,
        req,
      );
      //#endregion

      //#region response
      return await generateSuccessResponse(valid, null, req);
      //#endregion
    } else {
      //#region Create user
      const salt = await configuration_service.get(Configuration.SALT);

      const hash = await bcrypt.hash(password, parseInt(salt));
      let user = new UserEntity();
      user.email = email;
      user.password = hash;
      user.active = false;

      user = await user_service.add(user);

      if (user) {
        //#region send email
        await sendVerificationEmail(
          email,
          configuration_service,
          jwt_service,
          req,
        );
        //#endregion

        //#region response
        return await generateSuccessResponse(user, null, req);
        //#endregion
      }
      //#endregion
      throw generateFailedResponse(req, ErrorMessage.OPERATOR_USER_ERROR);
    }
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

export const sendVerificationEmail = async (
  email: string,
  configuration_service: ConfigurationService,
  jwt_service: JwtService,
  req: Request,
): Promise<void> => {
  const token = jwt_service.sign(
    { email },
    {
      secret: configuration_service.get(Configuration.ACCESS_SECRET_KEY),
      expiresIn: configuration_service.get(
        Configuration.VERIFY_TOKEN_EXPIRESIN,
      ),
    },
  );
  const url = `https://cextrading.io/verify/${token}`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    ignoreTLS: true,
    secure: true,
    auth: {
      user: configuration_service.get(Configuration.EMAIL_USERNAME),
      pass: configuration_service.get(Configuration.EMAIL_PASSWORD),
    },
  });

  transporter.sendMail(
    {
      to: email,
      subject: 'Xác thực email',
      html: `Nhấn vào đường dẫn sau để xác thực email của bạn: <a href="${url}">${url}</a>`,
    },
    (error, result) => {
      if (error) {
        //#region throw HandlerException
        return new HandlerException(
          UNKNOW_EXIT_CODE.UNKNOW_ERROR,
          req.method,
          req.url,
          ErrorMessage.OPERATOR_SEND_EMAIL_ERROR,
          HttpStatus.EXPECTATION_FAILED,
        );
        //#endregion
      }
    },
  );
};

export const verifyEmail = (
  token: string,
  configuration_service: ConfigurationService,
  log_service: LogService,
  req: Request,
) => {
  if (token) {
    //#region Decode token
    let payload: VerifyTokenResponse | HandlerException | null = null;
    jsonwebtoken.verify(
      token,
      configuration_service.get(Configuration.ACCESS_SECRET_KEY),
      (err, result) => {
        if (err) {
          payload = new HandlerException(
            AUTHENTICATION_EXIT_CODE.NO_TOKEN,
            req.method,
            req.url,
            ErrorMessage.EMAIL_TOKEN_EXPIRED_ERROR,
          );
        } else {
          const { email } = result as VerifyTokenResponse;
          payload = <VerifyTokenResponse>{
            email,
          };
        }
      },
    );
    //#endregion
    return payload;
    //#endregion
  } else {
    //#region Invalid Token
    log_service.writeLog(
      Levels.ERROR,
      req.method,
      req.url,
      sprintf(ErrorMessage.INVALID_TOKEN_ERROR, token),
    );

    return new InvalidTokenException(token, 1002, req.method, req.url);
    //#endregion
  }
};
