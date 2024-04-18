import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';

interface FollowType {
  _id?: ObjectId;
  followed_user_id: ObjectId;
  user_id: ObjectId;
  created_at?: Date;
}

class Follower {
  _id?: ObjectId;
  followed_user_id: ObjectId;
  created_at?: Date;
  user_id: ObjectId;
  constructor({ _id, user_id, created_at, followed_user_id }: FollowType) {
    this.created_at = created_at || new Date();
    this._id = _id || new ObjectId();
    this.followed_user_id = followed_user_id;
    this.user_id = user_id;
  }
}

export default Follower;
