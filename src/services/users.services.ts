import { ObjectId } from 'mongodb';
import { tokenType, UserVerifyStatus } from './../constants/enums';
import User from '~/models/schemas/User.schema';
import databaseService from './db.services';
import { RegisterReqBody } from '~/models/requests/User.request';
import { signToken } from '~/utils/jwt';
import { hashPassword } from '~/utils/crypto';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import dotenv from 'dotenv';
import USERS_MESSAGE from '~/constants/messages';
dotenv.config();
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, tokenType: tokenType.accessToken },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
    });
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, tokenType: tokenType.refreshToken },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN }
    });
  }
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, tokenType: tokenType.emailVerifyToken },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    });
  }
  private async createRefreshTokenAndAccessToken(user_id: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ]);
    return [accessToken, refreshToken];
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString());
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
    const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken(
      user_id.toString()
    );
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
  async login(user_id: string) {
    const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken(user_id);
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
      this.createRefreshTokenAndAccessToken(user_id),
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
    const email_verify_token = await this.signEmailVerifyToken(user_id);
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
    return { message: USERS_MESSAGE.EMAIL_RESEND_SUCCESS };
  }
}

const userService = new UserService();
export default userService;
