import User from '~/models/schemas/User.schema';
import databaseService from './db.services';
import { RegisterReqBody } from '~/models/requests/User.request';

class UserService {
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth) })
    );
    return result;
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }
}

const userService = new UserService();
export default userService;
