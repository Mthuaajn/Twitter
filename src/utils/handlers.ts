import { NextFunction, RequestHandler, Request, Response } from 'express';

export const wrapRequestHandler = (fn: RequestHandler) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
