import User from '~/models/schemas/User.schema';
import databaseService from './db.services';

class UserService {
  async register(payload: { email: string; password: string }) {
    const result = await databaseService.users.insertOne(new User(payload));
    return result;
  }
}

const userService = new UserService();
export default userService;
