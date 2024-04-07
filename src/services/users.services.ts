import { ObjectId } from 'mongodb';
import { tokenType, UserVerifyStatus } from './../constants/enums';
import User from '~/models/schemas/User.schema';
import databaseService from './db.services';
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.request';
import { signToken } from '~/utils/jwt';
import { hashPassword } from '~/utils/crypto';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import dotenv from 'dotenv';
import USERS_MESSAGE from '~/constants/messages';
dotenv.config();
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, tokenType: tokenType.accessToken, verify },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
    });
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, tokenType: tokenType.refreshToken, verify },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN }
    });
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, tokenType: tokenType.emailVerifyToken, verify },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    });
  }
  private signForgotPasswordToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      payload: { user_id, tokenType: tokenType.emailVerifyToken, verify },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    });
  }
  private async createRefreshTokenAndAccessToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ]);
    return [accessToken, refreshToken];
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    });
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    );
    console.log('email_verify_token', email_verify_token);
    // const user_id = result.insertedId.toString();
    const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    });
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id.toString()), token: refreshToken })
    );
    return {
      data: {
        result,
        accessToken,
        refreshToken
      }
    };
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken({
      user_id,
      verify
    });
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
    );
    return {
      accessToken,
      refreshToken
    };
  }
  async logout(refreshToken: string) {
    await databaseService.refreshToken.deleteOne({ token: refreshToken });
    return { message: USERS_MESSAGE.LOGOUT_SUCCESS };
  }
  async verify_email(user_id: string) {
    const [token] = await Promise.all([
      this.createRefreshTokenAndAccessToken({ user_id, verify: UserVerifyStatus.Unverified }),
      // giá trị đang trong giai đoạn cập nhật
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at: new Date()
          },
          $currentDate: {
            update_at: true
          }
        }
      )
    ]);
    const [access_token, refresh_token] = token;
    return {
      access_token,
      refresh_token
    };
  }
  async resend_email_verify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    });
    console.log('email_verify_token', email_verify_token);
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    // Gỉa bộ gửi email
    console.log('Rensend verify email: ', email_verify_token);
    return { message: USERS_MESSAGE.EMAIL_RESEND_SUCCESS };
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    });
    console.log('forgot_password_token', forgot_password_token);
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: USERS_MESSAGE.FORGOT_PASSWORD_SUCCESS
    };
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return { message: USERS_MESSAGE.RESET_PASSWORD_SUCCESS };
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    );
    return user;
  }
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload;
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth: Date })
        },
        $currentDate: {
          update_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    );
    return result;
  }
}

const userService = new UserService();
export default userService;
