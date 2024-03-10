import USERS_MESSAGE from '~/constants/messages';
import { checkSchema } from 'express-validator';
import userService from '~/services/users.services';
import { ErrorWithStatus } from '~/utils/Error';
import { validate } from '~/utils/validation';

export const registerValidator = validate(
  checkSchema({
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
  })
);
