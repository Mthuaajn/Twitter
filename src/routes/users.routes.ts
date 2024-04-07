import { wrapRequestHandler } from '~/utils/handlers';
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyForgotPasswordTokenValidator
} from './../middlewares/users.middlewares';
import { validate } from './../utils/validation';
import { Router } from 'express';
import {
  emailVerifyController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordController,
  verifyUserValidator
} from '~/controllers/users.controllers';

const userRouter = Router();
/**
 * description: login  user
 *  path: /login
 * method: POST
 * body:{ email:string, password:string}
 *
 */
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

/**
 * description: Register a new user
 *  path: /register
 * method: POST
 * body:{name:string, email:string, password:string, password_confirmation:string}
 *
 */
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController));

/**
 * description: logout a user
 *  path: /logout
 * method: POST
 * Headers: {Authorization: Bearer <accessToken>}
 * body:{refreshToken:string}
 */
userRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
);

userRouter.post('/refresh-token', (req, res) => {
  res.send('refresh token');
});

/**
 * description: email Verify  user
 *  path: /verify-email
 * method: POST
 * body:{emailVerify:string}
 */
userRouter.post(
  '/verify-email',
  emailVerifyTokenValidator,
  wrapRequestHandler(emailVerifyController)
);

/**
 * description: email Verify  user
 *  path: /verify-email
 * method: POST
 *  Headers: {Authorization: Bearer <accessToken>}
 * body:
 */
userRouter.post(
  '/resend-email-verify',
  accessTokenValidator,
  wrapRequestHandler(resendEmailVerifyController)
);

/**
 * description: email Verify  user
 *  path: /forgot-password
 * method: POST
 * body: { email : string}
 */
userRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
);

/**
 * description: verify forgot password token
 *  path: /verify-forgot-password
 * method: POST
 * body: { forgot_password_token : string}
 */
userRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
);

/**
 * description:reset password
 *  path: /reset-password
 * method: POST
 * body: { forgot_password_token : string,
 * password :string,
 * confirm_password : string}
 */
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
);

/**
 * description:get me profile
 *  path: /get-me
 * method: get
 *  Headers: {Authorization: Bearer <accessToken>}
 * body:
 */
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));

/**
 * description:update profile
 *  path: /get-me
 * method: patch
 * Headers: {Authorization: Bearer <accessToken>}
 * body: UserSchema
 */
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
);
export default userRouter;
