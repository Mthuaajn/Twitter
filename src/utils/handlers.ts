import { NextFunction, RequestHandler, Request, Response } from 'express';

export const wrapRequestHandler = <P>(fn: RequestHandler<P>) => {
  return async function (req: Request<P>, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

// mong muốn nhận vào là Request<{uername :string}
// thực nhận là Request<{key:value} : string>
