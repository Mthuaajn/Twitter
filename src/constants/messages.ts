const USERS_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',
  USER_NOT_FOUND: 'User not found',
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
  USER_NOT_AUTHORIZED: 'User is not',
  DAY_OF_BIRTH: 'IOS 8601 date format (YYYY-MM-DD)'
} as const;
export default USERS_MESSAGE;
