import { validate } from './../utils/validation';
import { Request, Response } from 'express';
import User from '~/models/schemas/User.schema';
import databaseService from '~/services/db.services';
import userService from '~/services/users.services';
import { checkSchema } from 'express-validator';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'nmt6465@gmail.com' && password === '123456') {
    res.status(200).json({ message: 'Login successfully' });
  } else {
    res.status(401).json({ message: 'Login failed!' });
  }
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email && !password) {
    res.status(401).json({ message: 'Email and password is required' });
  } else {
    try {
      const result = await userService.register({ email, password });
      return res.status(200).json({
        message: 'Register successfully',
        data: result
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: 'Register failed',
        error: err
      });
    }
  }
};

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
      errorMessage: 'Email is not valid'
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
            throw new Error('Password confirmation does not match password');
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
