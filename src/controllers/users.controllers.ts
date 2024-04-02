import { wrapRequestHandler } from './../utils/handlers';
import { validate } from './../utils/validation';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import User from '~/models/schemas/User.schema';
import databaseService from '~/services/db.services';
import userService from '~/services/users.services';
import { checkSchema } from 'express-validator';
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/requests/User.request';
import { ErrorWithStatus } from '~/utils/Error';
import USERS_MESSAGE from '~/constants/messages';
import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';

export const loginController = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
    const { user }: any = req;
    const { _id } = user;
    const result = await userService.login(_id.toString());
    return res.status(200).json({
      message: USERS_MESSAGE.LOGIN_SUCCESS,
      data: result
    });
  }
);

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
        result
      });
    }
  }
);

export const logoutController = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
    const { refreshToken } = req.body;
    const result = await userService.logout(refreshToken);
    res.status(200).json(result);
  }
);

export const emailVerifyValidator = wrapRequestHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decode_email_verify_token as TokenPayload;
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
    // nếu không tìm thấy user thì báo lỗi và trả về cho người dùng
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USERS_MESSAGE.USER_NOT_FOUND
      });
    }
    // đã verify thì không báo lỗi
    // trả về status ok với message đã verify email
    if (user?.email_verify_token === '') {
      res.status(HTTP_STATUS.OK).json({
        message: USERS_MESSAGE.EMAIL_ALREADY_VERIFY_BEFORE
      });
    }
    const result = await userService.verify_email(user_id);
    res.status(200).json({
      message: USERS_MESSAGE.EMAIL_SEND_SUCCESS,
      result
    });
  }
);
