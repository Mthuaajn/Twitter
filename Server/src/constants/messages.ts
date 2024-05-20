export const USERS_MESSAGE = {
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
  FORGOT_PASSWORD_TOKEN_SUCCESS: 'Forgot password token success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  USER_NOT_VERIFY: 'User unverified',
  NAME_MUST_BE_STRING: 'Name must be a string',
  IMAGE_MUST_BE_STRING: 'Image must be a string',
  IMAGE_URL_LENGTH: 'Image url must be less than 255 characters',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio must be less than 255 characters',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location must be less than 255 characters',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website must be less than 255 characters',
  GET_PROFILE_SUCCESS: 'Get profile success',
  GET_PROFILE_FAILED: 'Get profile failed',
  FOLLOWED_USER_ID_REQUIRED: 'Followed user id is required',
  FOLLOWED_USER: 'Followed user',
  FOLLOW_SUCCESS: 'Follow success',
  FOLLOWED_USER_NOT_FOUND: 'Followed user not found',
  UNFOLLOW_SUCCESS: 'Unfollow success',
  NOT_SELF_FOLLOWING: 'user not follow self',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only numbers',
  OLD_PASSWORD_INCORRECT: 'Old password not is incorrect',
  CONFIRM_PASSWORD_NOT_MATCH: 'Confirm password does not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  GMAIL_NOT_VERIFIED: 'Gmail is not verified',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success'
} as const;

export const TWEET_MESSAGE = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  CONTENT_MUST_BE_STRING: 'Content must be string',
  HASHTAG_MUST_BE_ARRAY_STRING: 'Hashtags must be array string',
  MENTIONS_MUST_BE_ARRAY_OBJECT_ID: 'Mentions must be array object id',
  MEDIAS_MUST_BE_ARRAY_MEDIA_TYPE: 'Medias must be array media type',
  CREATED: 'Tweet created successfully'
} as const;

export const BOOKMARK_MESSAGE = {
  BOOKMARK_CREATED: 'Bookmark created successfully'
};

export const LIKE_MESSAGE = {
  LIKE_CREATED: 'Like created successfully'
};
