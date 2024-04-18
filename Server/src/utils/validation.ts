import express from 'express';
import { body, validationResult, ContextRunner, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import { EntityError, ErrorWithStatus } from './Error';
import HTTP_STATUS from '~/constants/httpStatus';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req);
    // nếu mà không có lỗi thì next
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorsObj = errors.mapped();
    const entityError = new EntityError({ errors: {} });
    for (const key in errorsObj) {
      const { msg } = errorsObj[key];
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg);
      }
      entityError.errors[key] = errorsObj[key];
    }

    return next(entityError);
  };
};
