import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

import { returnObjects } from '@utils/index';

import {
  generateAccessToken,
  generateFailedResponse,
  generateRefreshToken,
  generateResponse,
  validatePassword,
} from '../utils';

import { createAccount, verifyEmail } from '../funcs';

import { LoginParamsDto } from '../dtos/login_params.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RenewalParamsDto } from '../dtos/renewal_params.dto';

import { JwtPayload } from '../interfaces/payloads/jwt_payload.interface';

import { HttpResponse } from '@interfaces/http-response.interface';
import { HttpNoneResponse } from '@interfaces/http-none-response.interface';
import { LoginResponse } from '../interfaces/login_response.interface';
import {
  ProfileResponse,
  VerifyTokenResponse,
} from '../interfaces/auth_response.interface';
import { RegisterResponse } from '../interfaces/register_response.interface';

import { AuthService } from '../services/auth.service';
import { ConfigurationService } from '@modules/shared/services/configuration/configuration.service';
import { LogService } from '@modules/log/services/log.service';
import { UserService } from '@modules/user/services/user.service';

import { HandlerException } from '@exceptions/handler-exception';
import { InvalidTokenException } from '../exceptions/invalid-token-exception';
import { UnauthorizedException } from '../exceptions/unauthorized-exception';
import { UnknownException } from '@exceptions/unknown-exception';

import { JwtAuthGuard } from '../guards/jwt.guard';
import { LogoutGuard } from '../guards/logout.guard';

import { Configuration } from '@modules/shared/constants/configuration.enum';
import { Levels } from '@constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  AUTHENTICATION_EXIT_CODE,
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
  VALIDATION_EXIT_CODE,
} from '@constants/enums/error-code.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private _logger: LogService,
    private readonly _authService: AuthService,
    private readonly _configurationService: ConfigurationService,
    private readonly _jwtService: JwtService,
    private readonly _userService: UserService,
  ) {
    // Due to transient scope, AuthController has its own unique instance of LogService,
    // so setting context here will not affect other instances in other services
    this._logger.setContext(AuthController.name);
  }

  /**
   * @method POST
   * @url /api/auth/login
   * @param email
   * @param password
   * @return HttpResponse<LoginResponse> | HttpException
   * @description Validate the account
   * @page Login page
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async login(
    @Body() params: LoginParamsDto,
    @Req() req: Request,
  ): Promise<HttpResponse<LoginResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      //#region get params
      const { password, email } = params;
      //#endregion

      const user = await this._authService.getUserByEmail(email);
      if (user) {
        if (user.active) {
          const is_match = await validatePassword(password, user.password);
          if (is_match) {
            //#region Generate access_token
            const access_token = generateAccessToken(
              this._jwtService,
              this._configurationService,
              user.id,
              user.email,
            );
            //#endregion

            //#region Generate refresh_token
            const refresh_token = generateRefreshToken(
              this._jwtService,
              this._configurationService,
              user.email,
            );
            //#endregion

            //#region Generate session
            let session = await this._authService.contains(email);

            if (!session) {
              session = await this._authService.add(
                user.id,
                user.email,
                access_token,
                refresh_token,
                new Date(),
                true,
              );
            } else {
              session = await this._authService.renew(
                access_token,
                refresh_token,
                session,
              );
            }

            //#region Generate response
            return await generateResponse(
              session,
              access_token,
              refresh_token,
              req,
            );
            //#endregion
          }
        } else {
          //#region throw HandlerException
          throw new HandlerException(
            DATABASE_EXIT_CODE.UNAUTHORIZE,
            req.method,
            req.url,
            ErrorMessage.ACTIVE_USER_ERROR,
            HttpStatus.BAD_REQUEST,
          );
          //#endregion
        }
      }
      //#region throw HandlerException
      throw new HandlerException(
        DATABASE_EXIT_CODE.UNKNOW_VALUE,
        req.method,
        req.url,
        ErrorMessage.LOGIN_FAILD,
        HttpStatus.NOT_FOUND,
      );
      //#endregion
    } catch (err) {
      console.log(err);
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }

  /**
   * @method GET
   * @url /api/auth/get-profile
   * @access private
   * @param
   * @returns HttpResponse<ProfileResponse> | HttpException
   * @description Get the account profile
   * @page Profile page
   */
  @Get('get-profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() req: Request,
  ): Promise<HttpResponse<ProfileResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      //#region Get Request
      const { user_id } = req.user as JwtPayload;
      //#endregion

      const session = await this._authService.getProfile(user_id);

      if (session) {
        const profile: ProfileResponse = {
          user_id: user_id,
          email: session.email,
        };

        //#region Generate response
        return returnObjects<ProfileResponse>(profile);
        //#endregion
      }
      //#region throw HandlerException
      throw new UnknownException(
        user_id,
        VALIDATION_EXIT_CODE.NOT_FOUND,
        req.method,
        req.url,
        ErrorMessage.ACCOUNT_NOT_FOUND_ERROR,
      );
      //#endregion
    } catch (err) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }

  /**
   * @method GET
   * @url /api/auth/logout
   * @access public
   * @returns HttpResponse | HttpException
   * @description Logout the account
   * @page Any page
   */
  @Get('logout')
  @UseGuards(LogoutGuard)
  async logout(@Req() req: Request): Promise<HttpNoneResponse | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      if (req.user) {
        const request_code = (req.user as JwtPayload).user_id;
        const session = await this._authService.getProfile(request_code);
        if (session) {
          //#region Cacncel session
          await this._authService.update(null, new Date(), session);
          //#endregion
        }
      }

      return {
        errorCode: 0,
        message: null,
        errors: null,
      };
    } catch (err) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }

  /**
   * @method POST
   * @url /api/auth/renew-token
   * @access public
   * @param refresh_token
   * @returns HttpResponse<LoginResponse> | HttpException
   * @description Renew the access_token
   * @page Any page
   */
  @Post('renew-token')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async renewal(
    @Body() params: RenewalParamsDto,
    @Req() req: Request,
  ): Promise<HttpResponse<LoginResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const { refresh_token } = params;

      //#region Session
      let session = await this._authService.isValid(refresh_token);

      if (session) {
        //#region Decode token
        const decoded = this._jwtService.verify(refresh_token, {
          secret: this._configurationService.get(
            Configuration.REFRESH_SECRET_KEY,
          ),
        });
        //#endregion

        // Check refresh_token whether is expired?
        if (Date.now() >= decoded.exp * 1000) {
          //#region Token expired
          //#region Session
          //#region Cancel session
          await this._authService.update(new Date(), null, session);
          //#endregion
          //#endregion

          //#region throw HandlerException
          throw new UnauthorizedException(
            refresh_token,
            AUTHENTICATION_EXIT_CODE.EXPIRED_TOKEN,
            req.method,
            req.url,
          );
          //#endregion
          //#endregion
        } else {
          //#region Generate access_token
          const renew_access_token = generateAccessToken(
            this._jwtService,
            this._configurationService,
            session.id,
            session.email,
          );
          //#endregion

          //#region Generate refresh_token
          const renew_refresh_token = generateRefreshToken(
            this._jwtService,
            this._configurationService,
            session.email,
          );
          //#endregion

          //#region Update session with new tokens
          session = await this._authService.renew(
            renew_access_token,
            renew_refresh_token,
            session,
          );
          //#endregion

          return await generateResponse(
            session,
            renew_access_token,
            renew_refresh_token,
            req,
          );
        }
      } else {
        //#region Token not found
        throw new InvalidTokenException(
          refresh_token,
          AUTHENTICATION_EXIT_CODE.INVALID_TOKEN,
          req.method,
          req.url,
        );
        //#endregion
      }
    } catch (err) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else if (params.refresh_token) {
        throw new UnauthorizedException(
          params.refresh_token,
          AUTHENTICATION_EXIT_CODE.EXPIRED_TOKEN,
          req.method,
          req.url,
        );
      } else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }

  /**
   * @method POST
   * @url /api/auth/register
   * @access public
   * @param email
   * @param password
   * @param permissions[]
   * @return
   * @descttiption
   * @page auth page
   */
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(
    @Body() params: RegisterDto,
    @Req() req: Request,
  ): Promise<HttpResponse<RegisterResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const user = await createAccount(
        params,
        this._authService,
        this._configurationService,
        this._userService,
        this._jwtService,
        req,
      );

      if (user instanceof HttpException) throw user;
      return user;
    } catch (err) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }

  @Get('verify/:token')
  async verifyEmail(
    @Param('token') token: string,
    @Req() req: Request,
  ): Promise<HttpResponse<VerifyTokenResponse> | HttpException> {
    console.log('----------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(token));

    this._logger.writeLog(
      Levels.LOG,
      req.method,
      req.url,
      JSON.stringify(token),
    );

    try {
      const result = await verifyEmail(
        token,
        this._configurationService,
        this._logger,
        req,
      );

      if (result instanceof HttpException) throw result;
      else {
        console.log('email: ', result);
        const { email } = result;

        //#region Get user by email
        const user = await this._authService.getUserByEmail(email);
        //#endregion
        if (user) {
          //#region active user
          const active = await this._userService.active(user);
          //#endregion
          if (active) return returnObjects({ email });
          throw generateFailedResponse(req, ErrorMessage.OPERATOR_USER_ERROR);
        }
        //#region throw HandlerException
        throw new HandlerException(
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          ErrorMessage.ACCOUNT_NOT_FOUND_ERROR,
          HttpStatus.NOT_FOUND,
        );
        //#endregion
      }
    } catch (error) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + error.message);

      if (error instanceof HttpException) throw error;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }
}
