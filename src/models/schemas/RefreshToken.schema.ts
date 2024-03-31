import { ObjectId } from 'mongodb';
interface RefreshTokenType {
  _id?: ObjectId;
  token: string;
  created_at?: Date;
  user_id: ObjectId;
}

export default class RefreshToken {
  _id?: ObjectId;
  token: string;
  create_at?: Date;
  user_id: ObjectId;
  constructor({ _id, token, user_id }: RefreshTokenType) {
    this._id = _id;
    this.token = token;
    this.create_at = new Date();
    this.user_id = user_id;
  }
}
