import { Like } from '~/models/schemas/Like.schema';

import { ObjectId } from 'mongodb';
import databaseService from './db.services';

class LikeService {
  async createLikeTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.like.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
          create_at: new Date()
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );
    return result;
  }

  async unLike(user_id: string, tweet_id: string) {
    console.log('user_id', user_id);
    console.log('tweet_id', tweet_id);
    const result = await databaseService.like.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    });
    return result;
  }
}

const likeService = new LikeService();
export default likeService;
