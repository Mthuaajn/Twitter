import { HashTag } from './../models/schemas/HashTag.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import { TweetRequestBody } from './../models/requests/Tweet.requrest';
import {
  MongoClient,
  ServerApiVersion,
  Db,
  Collection,
  ObjectId,
  WithoutId,
  WithId
} from 'mongodb';
import dotenv from 'dotenv';
import User from '~/models/schemas/User.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Follower from '~/models/schemas/Follower.schema';
import databaseService from './db.services';
dotenv.config();

class TweetService {
  async checkAndCreateHashTag(hashTags: string[]) {
    const DocumentHashTags = await Promise.all(
      hashTags.map(async (hashTag) => {
        return databaseService.hashTags.findOneAndUpdate(
          {
            name: hashTag
          },
          {
            $setOnInsert: {
              name: hashTag,
              create_at: new Date()
            }
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        );
      })
    );
    return DocumentHashTags.map((hashTag) => (hashTag as WithId<HashTag>)._id);
  }
  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashTag(body.hashtags);
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type: body.type,
        audience: body.audience,
        parent_id: body.parent_id,
        content: body.content,
        hashtags: hashtags, // chổ này tạm thời để trống
        mentions: body.mentions,
        medias: body.medias
      })
    );
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId });
    return tweet;
  }
  async getTweet(tweet_id: string) {
    const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(tweet_id) });
    return tweet;
  }
}

const tweetService = new TweetService();
export default tweetService;
