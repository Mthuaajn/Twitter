import { ObjectId } from 'mongodb';

interface LikeType {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  create_at?: Date;
}

export class Like {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  create_at?: Date;
  constructor({ _id, user_id, tweet_id, create_at }: LikeType) {
    this._id = _id || new ObjectId();
    this.user_id = new ObjectId(user_id);
    this.tweet_id = new ObjectId(tweet_id);
    this.create_at = create_at || new Date();
  }
}
