import IResponse from "@src/types/response";

export default class HttpException extends Error {
  error: IResponse;

  constructor(error: IResponse) {
    super();
    this.error = error;
  }
}
