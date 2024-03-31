import { ObjectId } from 'mongodb';
import { tokenType } from './../constants/enums';
import User from '~/models/schemas/User.schema';
import databaseService from './db.services';
import { RegisterReqBody } from '~/models/requests/User.request';
import { signToken } from '~/utils/jwt';
import { hashPassword } from '~/utils/crypto';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import dotenv from 'dotenv';
dotenv.config();
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, tokenType: tokenType.accessToken },
      options: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
    });
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, tokenType: tokenType.refreshToken },
      options: { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN }
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
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    );
    const user_id = result.insertedId.toString();
    const [accessToken, refreshToken] = await this.createRefreshTokenAndAccessToken(user_id);
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
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
}

const userService = new UserService();
export default userService;
