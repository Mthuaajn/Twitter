import Tweet from '~/models/schemas/Tweet.schema';
import { TweetRequestBody } from './../models/requests/Tweet.requrest';
import { MongoClient, ServerApiVersion, Db, Collection, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import User from '~/models/schemas/User.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Follower from '~/models/schemas/Follower.schema';
import databaseService from './db.services';
dotenv.config();

class TweetService {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type: body.type,
        audience: body.audience,
        parent_id: body.parent_id,
        content: body.content,
        hashtags: [], // chổ này tạm thời để trống
        mentions: body.mentions,
        medias: body.medias
      })
    );
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId });
    return tweet;
  }
}

const tweetService = new TweetService();
export default tweetService;
