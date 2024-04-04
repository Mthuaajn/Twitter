const USERS_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  NAME_REQUIRED: 'Name is required',
  USER_EXIST: 'User is already exist',
  LOGIN_FAILED: 'Login failed',
  LOGIN_SUCCESS: 'Login successfully',
  REGISTER_SUCCESS: 'Register successfully',
  REGISTER_FAILED: 'Register failed',
  EMAIL_PASSWORD_REQUIRED: 'Email and password is required',
  EMAIL_NOT_VALID: 'Email is not valid',
  EMAIL_ALREADY_EXIST: 'Email is already exist',
  NAME_LENGTH: 'Name must be at least 1 characters and less than 100 characters',
  PASSWORD_LENGTH: 'Password must be at least 6 characters and less than 12 characters',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters, and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol',
  PASSWORD_MUST_BE_STRING: 'Password',
  EMAIL_REQUIRED: 'Email is required',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  USER_NOT_AUTHORIZED: 'User is not authorized',
  USER_NOT_FOUND: 'User is not found',
  DAY_OF_BIRTH: 'IOS 8601 date format (YYYY-MM-DD)',
  ACCESS_TOKEN_INVALID: 'Access token is invalid',
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_STRING: 'Refresh token must be a string',
  REFRESH_TOKEN_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_NOT_EXIST: 'Refresh token does not exist',
  LOGOUT_SUCCESS: 'Logout successfully',
  EMAIL_VERIFY_SUCCESS: 'send email verify success',
  EMAIL_VERIFY_FAILED: 'email verify failed',
  EMAIL_VERIFY_TOKEN_REQUIRED: 'Email verify token is required',
  EMAIL_ALREADY_VERIFY_BEFORE: 'Email is already verify before',
  EMAIL_SEND_SUCCESS: 'Email send success',
  EMAIL_SEND_FAILED: 'Email send failed',
  EMAIL_RESEND_SUCCESS: 'Email resend success',
  FORGOT_PASSWORD_SUCCESS: 'Forgot password success',
  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token is invalid',
  FORGOT_PASSWORD_TOKEN_SUCCESS: 'Forgot password token success'
} as const;
export default USERS_MESSAGE;
