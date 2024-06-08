import { TweetType } from './../constants/enums';
import { HashTag } from './../models/schemas/HashTag.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import { TweetRequestBody } from '../models/requests/Tweet.request';
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
  async increaseTweetViews(tweet_id: string, user_id: string) {
    const checkLogin = user_id ? { user_views: 1 } : { guest_views: 1 };
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: checkLogin,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    );
    return result;
  }
  async getTweetChildren({
    tweet_id,
    page,
    limit,
    tweet_type,
    user_id
  }: {
    tweet_id: string;
    page: number;
    limit: number;
    tweet_type: TweetType;
    user_id?: string;
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },

        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  name: '$$mention.name'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Retweet] }
                }
              }
            },
            commentTweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Comment] }
                }
              }
            },
            quoteTweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray();

    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const ids = tweets.map((tweet) => tweet._id as ObjectId);
    const date = new Date();

    const [, totalDocument] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ]);

    tweets.forEach((tweet) => {
      if (user_id) {
        tweet.user_views += 1;
      } else {
        tweet.guest_views += 1;
      }
      tweet.updated_at = date;
    });
    return {
      tweets,
      totalDocument
    };
  }
  async getNewFeedTweet({
    user_id,
    page,
    limit
  }: {
    user_id: string;
    page: number;
    limit: number;
  }) {
    const follower_user_id = await databaseService.follower
      .find(
        {
          user_id: new ObjectId(user_id)
        },
        {
          projection: {
            _id: 0,
            followed_user_id: 1
          }
        }
      )
      .toArray();
    const ids = follower_user_id.map((el) => el.followed_user_id);
    ids.push(new ObjectId(user_id));

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    { audience: 1 },
                    {
                      'user.tweet_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },

          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    email: '$$mention.email',
                    username: '$$mention.username',
                    name: '$$mention.name'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $addFields: {
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: { $eq: ['$$item.type', TweetType.Retweet] }
                  }
                }
              },
              commentTweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: { $eq: ['$$item.type', TweetType.Comment] }
                  }
                }
              },
              quoteTweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                tweet_circle: 0,
                date_of_birth: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.tweet_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ]);

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId);
    const date = new Date();
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: {
          user_views: 1
        },
        $set: {
          updated_at: date
        }
      }
    );
    tweets.forEach((tweet) => {
      tweet.user_views += 1;
      tweet.updated_at = date;
    });
    return { tweets, totalDocument: total[0]?.total || 0 };
  }
}

const tweetService = new TweetService();
export default tweetService;
