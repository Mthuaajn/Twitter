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

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: 'Name must be at least 1 characters and less than 100 characters'
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      errorMessage: 'Email is not valid',
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
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 12
        }
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
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 12
        }
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
      errorMessage: 'Date of birth is not valid'
    }
  })
);
