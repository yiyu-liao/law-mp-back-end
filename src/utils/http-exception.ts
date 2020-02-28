export interface IErrorResponse {
  code: number | string;
  msg: string;
}

export default class HttpException extends Error {
  error: IErrorResponse;

  constructor(error: IErrorResponse) {
    super();
    this.error = error;
  }
}
