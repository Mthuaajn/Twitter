import HTTP_STATUS from '~/constants/httpStatus';
import USERS_MESSAGE from '~/constants/messages';

type ErrorType = Record<
  string,
  {
    msg: string;
    [key: string]: any; // thêm key này để có thể thêm các key khác vào object
  }
>; // {[key:string] : string được thay thế bằng object}
export class ErrorWithStatus {
  status: number;
  message: string;
  constructor({ message, status }: { message: string; status: number }) {
    this.status = status;
    this.message = message;
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorType;
  constructor({
    message = USERS_MESSAGE.VALIDATION_ERROR,
    errors
  }: {
    message?: string;
    errors: ErrorType;
  }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY });
    this.errors = errors;
  }
}
