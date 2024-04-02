import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from './../middlewares/users.middlewares';
import { validate } from './../utils/validation';
import { Router } from 'express';
import {
  emailVerifyValidator,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers';

const userRouter = Router();
/**
 * description: login  user
 *  path: /login
 * method: POST
 * body:{ email:string, password:string}
 *
 */
userRouter.post('/login', loginValidator, loginController);

/**
 * description: Register a new user
 *  path: /register
 * method: POST
 * body:{name:string, email:string, password:string, password_confirmation:string}
 *
 */
userRouter.post('/register', registerValidator, registerController);

/**
 * description: logout a user
 *  path: /logout
 * method: POST
 * Headers: {Authorization: Bearer <accessToken>}
 * body:{refreshToken:string}
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController);

userRouter.post('/refresh-token', (req, res) => {
  res.send('refresh token');
});

/**
 * description: email Verify  user
 *  path: /verify-email
 * method: POST
 * body:{emailVerify:string}
 */
userRouter.post('/verify-email', emailVerifyTokenValidator, emailVerifyValidator);

export default userRouter;
