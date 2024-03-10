import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';
import HTTP_STATUS from '~/constants/httpStatus';
export const defaultErrorHandlers = (err: any, req: Request, res: Response, next: NextFunction) => {
  //  omit để loại bỏ status trong object err
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, 'status'));
};
