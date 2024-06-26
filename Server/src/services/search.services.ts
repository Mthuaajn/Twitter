import { ObjectId, WithId } from 'mongodb';
import databaseService from './db.services';
import { MediaType, MediaTypeQuery, PeopleFollow, TweetType } from '~/constants/enums';
import { HashTag } from '~/models/schemas/HashTag.schema';

class SearchService {
  async search({
    page,
    limit,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    page: number;
    limit: number;
    content: string;
    user_id: string;
    media_type: string;
    people_follow: PeopleFollow;
  }) {
    const $match: any = {
      $text: {
        $search: content
      }
    };
    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image;
      }
      if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = MediaType.Video;
      }
    }
    if (people_follow || people_follow === PeopleFollow.Anyone) {
      const people_follow_ids = await databaseService.follower
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
      const ids = people_follow_ids.map((el) => el.followed_user_id);
      ids.push(new ObjectId(user_id));
      $match['user_id'] = {
        $in: ids
      };
    }
    const [tweets, total] = await Promise.all([
      await databaseService.tweets
        .aggregate([
          {
            $match
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
                { audience: 0 },
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
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
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
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email'
                  }
                }
              }
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
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
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
                    cond: {
                      $eq: ['$$item.type', TweetType.Retweet]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.QuoteTweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Comment]
                    }
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
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      await databaseService.tweets
        .aggregate([
          { $match },
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
    const tweet_ids = tweets.map((el) => el._id as ObjectId);
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
    tweets.forEach((el) => {
      el.updated_at = date;
      el.user_views += 1;
    });
    return {
      tweets,
      total: total[0]?.total || 0
    };
  }
}
const searchService = new SearchService();

export default searchService;
