import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/utils/Error';
export const defaultErrorHandlers = (err: any, req: Request, res: Response, next: NextFunction) => {
  //  omit để loại bỏ status trong object err
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']));
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true });
  });
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: err
  });
};
