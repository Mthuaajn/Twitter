import { verifyToken } from './../utils/jwt';
import { ObjectId } from 'mongodb';
import { tokenType, UserVerifyStatus } from './../constants/enums';
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.request';
import { signToken } from '~/utils/jwt';
import { hashPassword } from '~/utils/crypto';
import { ErrorWithStatus } from '~/utils/Error';
import axios from 'axios';
import User from '~/models/schemas/User.schema';
import databaseService from './db.services';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import dotenv from 'dotenv';
import { USERS_MESSAGE } from '~/constants/messages';
import HTTP_STATUS from '~/constants/httpStatus';
import Follower from '~/models/schemas/Follower.schema';
import { access } from 'fs';

dotenv.config();

class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, tokenType: tokenType.accessToken, verify },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
    });
  }
  private signRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string;
    verify: UserVerifyStatus;
    exp?: number;
  }) {
    if (exp) {
      return signToken({
        payload: { user_id, tokenType: tokenType.refreshToken, verify, exp },
        privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string
      });
    }
    return signToken({
      payload: {
        user_id,
        token_type: tokenType.refreshToken,
        verify
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
      }
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
  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: process.env.JWT_REFRESH_TOKEN_SECRET as string
    });
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
        username: `user${user_id.toString()}`,
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
    const { exp, iat } = await this.decodeRefreshToken(refreshToken);
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id.toString()),
        token: refreshToken,
        exp: exp,
        iat: iat
      })
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
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    };
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return data as {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
      token_type: string;
      id_token: string;
    };
  }
  private async getGoogleInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    });
    return data as {
      is: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    };
  }
  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code);
    const userInfo = await this.getGoogleInfo(access_token, id_token);
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGE.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      });
    }
    // kiem tra email da dang ki chua
    const user = await databaseService.users.findOne({ email: userInfo.email });
    // neu ton tai thi cho login vao
    if (user) {
      const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken({
        user_id: user._id.toString(),
        verify: user.verify
      });
      const { exp, iat } = await this.decodeRefreshToken(refreshToken);
      await databaseService.refreshToken.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user._id.toString()),
          token: refreshToken,
          exp: exp,
          iat: iat
        })
      );
      return {
        accessToken,
        refreshToken,
        newUser: 0,
        verify: user.verify
      };
    } else {
      const password = Math.random().toString(36).substring(2, 15);
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      });
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Verified
      };
    }
  }
  async refreshToken({
    user_id,
    refreshToken,
    verify,
    exp
  }: {
    user_id: string;
    refreshToken: string;
    verify: UserVerifyStatus;
    exp?: number;
  }) {
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshToken.deleteOne({ token: refreshToken })
    ]);
    const decodeRefreshToken = await this.decodeRefreshToken(newRefreshToken);
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: newRefreshToken,
        exp: decodeRefreshToken.exp,
        iat: decodeRefreshToken.iat
      })
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken({
      user_id,
      verify
    });
    const { exp, iat } = await this.decodeRefreshToken(refreshToken);
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refreshToken,
        exp: exp,
        iat: iat
      })
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
    const { exp, iat } = await this.decodeRefreshToken(refresh_token);
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id.toString()),
        token: refresh_token,
        exp: exp,
        iat: iat
      })
    );
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
    console.log('Resend verify email: ', email_verify_token);
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
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    );
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGE.GET_PROFILE_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      });
    }
    return user;
  }
  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.follower.findOne({
      followed_user_id: new ObjectId(followed_user_id)
    });
    if (follower !== null) {
      return {
        message: USERS_MESSAGE.FOLLOWED_USER
      };
    }
    await databaseService.follower.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    );
    return {
      message: USERS_MESSAGE.FOLLOW_SUCCESS
    };
  }
  async unFollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.follower.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });
    if (follower === null) {
      return {
        message: USERS_MESSAGE.FOLLOWED_USER_NOT_FOUND
      };
    }
    await databaseService.follower.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });
    return {
      message: USERS_MESSAGE.UNFOLLOW_SUCCESS
    };
  }
  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: USERS_MESSAGE.CHANGE_PASSWORD_SUCCESS
    };
  }
}

const userService = new UserService();
export default userService;
