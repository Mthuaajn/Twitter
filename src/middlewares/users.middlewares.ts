import { Request } from 'express';
import USERS_MESSAGE from '~/constants/messages';
import { checkSchema } from 'express-validator';
import userService from '~/services/users.services';
import { ErrorWithStatus } from '~/utils/Error';
import { validate } from '~/utils/validation';
import databaseService from '~/services/db.services';
import { hashPassword } from '~/utils/crypto';
import { verifyToken } from '~/utils/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';

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
      password: {
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
      },
      confirm_password: {
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
      },
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
        notEmpty: {
          errorMessage: USERS_MESSAGE.ACCESS_TOKEN_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1];
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.ACCESS_TOKEN_REQUIRED,
                status: 401
              });
            }
            try {
              const decoded_authorization = await verifyToken({ token: access_token });
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
      notEmpty: {
        errorMessage: USERS_MESSAGE.REFRESH_TOKEN_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGE.REFRESH_TOKEN_STRING
      },
      custom: {
        options: async (value, { req }) => {
          try {
            const [decoded_refresh_token, refreshToken] = await Promise.all([
              await verifyToken({ token: value }),
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
