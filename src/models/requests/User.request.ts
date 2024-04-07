import { JwtPayload } from 'jsonwebtoken';
import { tokenType } from '~/constants/enums';

// định nghĩa những interface request body gửi lên
export interface RegisterReqBody {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
}

export interface emailVerifyReqBody {
  email_verify_token: string;
}
export interface LoginReqBody {
  email: string;
  password: string;
}
export interface LogoutReqBody {
  refreshToken: string;
}

export interface ForgotPasswordReqBody {
  email: string;
}
export interface TokenPayload extends JwtPayload {
  type: tokenType;
  user_id: string;
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string;
}

export interface ResetPasswordReqBody {
  password: string;
  confirm_password: string;
  forgot_password_token: string;
}

export interface UpdateMeReqBody {
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}
