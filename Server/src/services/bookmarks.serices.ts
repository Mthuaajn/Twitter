import { BookMark } from './../models/schemas/BookMark.schema';
import { ObjectId, WithId } from 'mongodb';
import databaseService from './db.services';

class BookMarkService {
  async createBookMark(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmark.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new BookMark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
          created_at: new Date()
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );
    return result;
  }
  async unBookMark(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmark.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    });
    return result;
  }
}

const bookMarkService = new BookMarkService();
export default bookMarkService;
