import { wrapRequestHandler } from './../utils/handlers';
import { validate } from './../utils/validation';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import User from '~/models/schemas/User.schema';
import databaseService from '~/services/db.services';
import userService from '~/services/users.services';
import { checkSchema } from 'express-validator';
import { RegisterReqBody } from '~/models/requests/User.request';
import { ErrorWithStatus } from '~/utils/Error';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'nmt6465@gmail.com' && password === '123456') {
    res.status(200).json({ message: 'Login successfully' });
  } else {
    res.status(401).json({ message: 'Login failed!' });
  }
};

export const registerController = wrapRequestHandler(
  async (
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    if (!email && !password) {
      res.status(401).json({ message: 'Email and password is required' });
    } else {
      const result = await userService.register(req.body);
      return res.status(200).json({
        message: 'Register successfully',
        data: result
      });
    }
  }
);

