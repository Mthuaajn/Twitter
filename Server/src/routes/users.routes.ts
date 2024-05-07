import { wrapRequestHandler } from '~/utils/handlers';
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followedValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowedValidator,
  updateMeValidator,
  verifyForgotPasswordTokenValidator
} from './../middlewares/users.middlewares';
import { validate } from './../utils/validation';
import { Router } from 'express';
import {
  changePasswordController,
  emailVerifyController,
  followedController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unFollowedController,
  updateMeController,
  verifyForgotPasswordController,
  verifyUserValidator
} from '~/controllers/users.controllers';
import { UpdateMeReqBody } from '~/models/requests/User.request';
import { filterMiddleware } from '~/middlewares/common.middlewares';

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

userRouter.post(
  '/refresh-token',
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
);

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
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'username',
    'website'
  ]),
  updateMeValidator,
  wrapRequestHandler(updateMeController)
);

/**
 * description:get  profile
 *  path: /:username
 * method: get
 */
userRouter.get('/:username', wrapRequestHandler(getProfileController));

/**
 * description:follow user
 *  path: /followed
 * method: Post
 * Headers: {Authorization: Bearer <accessToken>}
 * body: {followed_user_id:string}
 */
userRouter.post(
  '/followed',
  followedValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(followedController)
);

/**
 * description:unFollow user
 *  path: /follow/:user_id
 * method: Delete
 * Headers: {Authorization: Bearer <accessToken>}
 */
userRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  unFollowedValidator,
  verifyUserValidator,
  wrapRequestHandler(unFollowedController)
);

/**
 * description:change password
 *  path: /change-password
 * method: put
 * Headers: {Authorization: Bearer <accessToken>}
 * Body: {old_password:string, new_password:string, confirm_password:string}
 */
userRouter.put(
  '/change-password',
  accessTokenValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
);

userRouter.get('/oauth/google', wrapRequestHandler(oauthController));
export default userRouter;
