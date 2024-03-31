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
import USERS_MESSAGE from '~/constants/messages';

export const loginController = wrapRequestHandler(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { _id } = user;
  const result = await userService.login(_id.toString());
  return res.status(200).json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    data: result
  });
});

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
        message: USERS_MESSAGE.REGISTER_SUCCESS,
        data: result
      });
    }
  }
);
