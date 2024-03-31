import { Request } from 'express';
import User from '~/models/schemas/User.schema';
declare module 'express' {
  // mở rộng kiểu dữ liệu cho request
  interface Request {
    user?: User;
  }
}
