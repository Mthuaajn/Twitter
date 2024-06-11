import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/utils/Error';
export const defaultErrorHandlers = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    //  omit để loại bỏ status trong object err
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']));
    }
    const finalError: any = {};
    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return;
      }
      finalError[key] = err[key];
    });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      errorInfo: omit(finalError, ['stack'])
    });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(err as any, ['stack'])
    });
  }
};
