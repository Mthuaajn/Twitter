import { ObjectId } from 'mongodb';
interface RefreshTokenType {
  _id?: ObjectId;
  token: string;
  created_at?: Date;
  user_id: ObjectId;
  exp: number;
  iat: number;
}

export default class RefreshToken {
  _id?: ObjectId;
  token: string;
  create_at?: Date;
  user_id: ObjectId;
  exp: Date;
  iat: Date;
  constructor({ _id, token, user_id, exp, iat }: RefreshTokenType) {
    this._id = _id;
    this.token = token;
    this.create_at = new Date();
    this.user_id = user_id;
    this.exp = new Date(exp * 1000);
    this.iat = new Date(iat * 1000);
  }
}
