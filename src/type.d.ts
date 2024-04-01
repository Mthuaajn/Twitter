import { Request } from 'express';
import User from '~/models/schemas/User.schema';
import { TokenPayload } from './models/requests/User.request';
declare module 'express' {
  // mở rộng kiểu dữ liệu cho request
  interface Request {
    user?: User;
    decode_authorization?: TokenPayload;
    decode_refresh_token?: TokenPayload;
  }
}
