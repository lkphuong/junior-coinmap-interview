import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ValidationArguments, isEmpty } from 'class-validator';

import { HttpPagingResponse } from '@interfaces/http-paging-response.interface';
import { HttpResponse } from '@interfaces/http-response.interface';

import { VerifyTokenMiddleware } from '@modules/auth/middlewares/auth.middleware';

export const applyMiddlewares = (consumer: MiddlewareConsumer) => {
  consumer
    .apply(VerifyTokenMiddleware)
    .exclude(
      { path: '/auth/login', method: RequestMethod.POST },
      { path: '/auth/renew-token', method: RequestMethod.POST },
      { path: '/auth/register', method: RequestMethod.POST },
    )
    .forRoutes({ path: '*', method: RequestMethod.ALL });
};

export const trim = (str: string): string => (!isEmpty(str) ? str.trim() : '');

export const generateValidationMessage = (
  arg: ValidationArguments,
  message: string,
): string => JSON.stringify({ [arg.property]: message });

export const returnObjects = <T>(
  data: T | T[] | null,
  errorCode?: number,
  message?: string | null,
  errors?: [{ [key: string]: string }] | null,
): HttpResponse<T> => {
  return {
    data: data,
    errorCode: data != null ? 0 : errorCode ?? 0,
    message: data !== null ? null : message,
    errors: errors ?? null,
  };
};

export const returnObjectsWithPaging = <T>(
  pages: number,
  page: number,
  data: T | T[] | null,
  errorCode?: number,
  message?: string | null,
  errors?: [{ [key: string]: string }] | null,
): HttpPagingResponse<T> => {
  return {
    data: {
      pages,
      page,
      data,
    },
    errorCode: data != null ? 0 : errorCode ?? 9001,
    message: data !== null ? null : message,
    errors: errors ?? null,
  };
};

export const sprintf = (str, ...argv) =>
  !argv.length
    ? str
    : sprintf((str = str.replace('%s' || '$', argv.shift())), ...argv);
