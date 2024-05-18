import { wrapRequestHandler } from './../utils/handlers';
import { validate } from './../utils/validation';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import User from '~/models/schemas/User.schema';
import databaseService from '~/services/db.services';
import userService from '~/services/users.services';
import { checkSchema } from 'express-validator';
import {
  ChangePasswordReqBody,
  emailVerifyReqBody,
  FollowUserReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnFollowUserReqParams,
  UpdateMeReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.request';
import { ErrorWithStatus } from '~/utils/Error';
import { USERS_MESSAGE } from '~/constants/messages';
import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';
import { UserVerifyStatus } from '~/constants/enums';
import { config } from 'dotenv';
config();
export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  if (req.decode_authorization === undefined) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_FOUND,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  const { verify } = req.decode_authorization as TokenPayload;
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_VERIFY,
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
) => {
  const { user }: any = req;
  const { _id } = user;
  const result = await userService.login({ user_id: _id.toString(), verify: user.verify });
  return res.status(200).json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    data: result
  });
};

export const registerController = async (
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
};

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
) => {
  const { refreshToken } = req.body;
  const result = await userService.logout(refreshToken);
  res.status(200).json(result);
};

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, emailVerifyReqBody>,
  res: Response,
  next: NextFunction
) => {
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
};

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    });
  }
  if (user?.verify === UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFY_BEFORE
    });
  }
  const result = await userService.resend_email_verify(user_id.toString());
  res.status(200).json(result);
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User;
  const result = await userService.forgotPassword({
    user_id: (_id as ObjectId)?.toString(),
    verify
  });
  res.status(200).json(result);
};

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_SUCCESS
  });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload;
  const { password } = req.body;
  const result = await userService.resetPassword(user_id.toString(), password);
  res.status(HTTP_STATUS.OK).json(result);
};

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await userService.getMe(user_id.toString());

  res.status(HTTP_STATUS.OK).json(result);
};

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { body } = req;
  const result = await userService.updateMe(user_id.toString(), body);
  res.status(HTTP_STATUS.OK).json({
    message: 'update profile success',
    result
  });
};
export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params;
  const user = await userService.getProfile(username);
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGE.GET_PROFILE_SUCCESS,
    data: user
  });
};

export const followedController = async (req: Request<FollowUserReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { followed_user_id } = req.body;
  const result = await userService.follow(user_id.toString(), followed_user_id.toString());
  res.json(result);
};

export const unFollowedController = async (req: Request<UnFollowUserReqParams>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { user_id: followed_user_id } = req.params;
  const result = await userService.unFollow(user_id.toString(), followed_user_id.toString());
  res.status(HTTP_STATUS.OK).json(result);
};

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { new_password } = req.body;
  const result = await userService.changePassword(user_id.toString(), new_password);
  res.status(HTTP_STATUS.OK).json(result);
};

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query;
  const result = await userService.oauth(code as string);
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&new_user=${result.newUser}&verify=${result.verify}`;
  return res.redirect(urlRedirect);
};

export const refreshTokenController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const { user_id, verify, exp } = req.decode_refresh_token as TokenPayload;
  const result = await userService.refreshToken({ user_id, refreshToken, verify, exp });
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGE.REFRESH_TOKEN_SUCCESS,
    result
  });
};
