import { NextFunction, Request, Response } from 'express';
import USERS_MESSAGE from '~/constants/messages';
import { checkSchema, ParamSchema } from 'express-validator';
import userService from '~/services/users.services';
import { ErrorWithStatus } from '~/utils/Error';
import { validate } from '~/utils/validation';
import databaseService from '~/services/db.services';
import { hashPassword } from '~/utils/crypto';
import { verifyToken } from '~/utils/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import HTTP_STATUS from '~/constants/httpStatus';
import { TokenPayload } from '~/models/requests/User.request';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';

const password: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 12
    },
    errorMessage: USERS_MESSAGE.PASSWORD_LENGTH
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      'Password must be at least 6 characters, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
  }
};
const confirm_password: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 12
    },
    errorMessage: USERS_MESSAGE.PASSWORD_LENGTH
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      'Password must be at least 6 characters, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
  },
  custom: {
    // function check confirm password match password to request
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new ErrorWithStatus({
          message: 'Password confirmation does not match password',
          status: 422
        });
      }
      return true;
    }
  }
};
const forgot_password_token: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_REQUIRED
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
          status: HTTP_STATUS.UNAUTHORIZED
        });
      }
      try {
        const decode_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET as string
        });
        const { user_id } = decode_forgot_password_token as TokenPayload;
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
        if (user === null) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          });
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          });
        }
        req.decode_forgot_password_token = decode_forgot_password_token as TokenPayload;
      } catch (err) {
        if (err instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          });
        }
        throw err;
      }
      return true;
    }
  }
};
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_NOT_VALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            });
            if (!user) {
              throw new Error(USERS_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            req.user = user;
            return true;
          }
        }
      }
    },
    ['body']
  )
);
export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.NAME_REQUIRED
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USERS_MESSAGE.NAME_LENGTH
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_NOT_VALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const result = await userService.checkEmailExist(value);
            if (result) {
              throw new Error('Email is already exist');
            }
            return true;
          }
        }
      },
      password,
      confirm_password,
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        },
        errorMessage: USERS_MESSAGE.DAY_OF_BIRTH
      }
    },
    ['body']
  )
);

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            const access_token = (value || '').split(' ')[1];
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
              (req as Request).decode_authorization = decoded_authorization;
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGE.ACCESS_TOKEN_INVALID,
                  status: 401
                });
              }
            }
            return true;
          }
        }
      }
    },
    ['headers']
  )
);

export const refreshTokenValidator = validate(
  checkSchema({
    refreshToken: {
      isString: {
        errorMessage: USERS_MESSAGE.REFRESH_TOKEN_STRING
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.REFRESH_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            });
          }
          try {
            const [decoded_refresh_token, refreshToken] = await Promise.all([
              await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_REFRESH_TOKEN_SECRET as string
              }),
              await databaseService.refreshToken.findOne({ token: value })
            ]);
            if (refreshToken === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.REFRESH_TOKEN_NOT_EXIST,
                status: 401
              });
            }
            (req as Request).decode_refresh_token = decoded_refresh_token;
          } catch (err) {
            if (err instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.REFRESH_TOKEN_INVALID,
                status: 401
              });
            } else {
              throw err;
            }
          }
        }
      }
    }
  })
);

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      isString: {
        errorMessage: USERS_MESSAGE.REFRESH_TOKEN_STRING
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            });
          }
          try {
            const decode_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET as string
            });

            (req as Request).decode_email_verify_token = decode_email_verify_token;
          } catch (err) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.EMAIL_VERIFY_FAILED,
              status: HTTP_STATUS.UNAUTHORIZED
            });
          }
        }
      }
    }
  })
);

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_NOT_VALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            });
            if (!user) {
              throw new Error(USERS_MESSAGE.USER_NOT_FOUND);
            }
            req.user = user;
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema({
    forgot_password_token
  })
);

export const resetPasswordValidator = validate(
  checkSchema({
    password,
    confirm_password,
    forgot_password_token
  })
);

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
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
