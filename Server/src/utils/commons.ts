import { USERS_MESSAGE } from '~/constants/messages';
import { ErrorWithStatus } from './Error';
import { verifyToken } from './jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Request } from 'express';

export const numberEnumToArray = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === 'number') as number[];
};

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGE.ACCESS_TOKEN_REQUIRED,
      status: 401
    });
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_ACCESS_TOKEN_SECRET as string
    });
    if (req) {
      (req as Request).decode_authorization = decoded_authorization;
      return true;
    }
    return decoded_authorization;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGE.ACCESS_TOKEN_INVALID,
        status: 401
      });
    }
  }
};
