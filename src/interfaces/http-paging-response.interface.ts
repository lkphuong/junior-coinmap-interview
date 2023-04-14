import { HttpNoneResponse } from './http-none-response.interface';

export type HttpPagingResponse<T> = HttpNoneResponse & {
  data: {
    pages: number;
    page: number;
    data: T[] | T | null;
    count?: number;
  };
};
