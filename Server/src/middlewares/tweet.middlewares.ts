import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from './../constants/enums';
import { numberEnumToArray } from './../utils/commons';
import { checkSchema } from 'express-validator';
import { validate } from './../utils/validation';
import { TWEET_MESSAGE } from '~/constants/messages';
import { ObjectId } from 'mongodb';
import { isEmpty } from 'lodash';
import { ErrorWithStatus } from '~/utils/Error';
import databaseService from '~/services/db.services';
import HTTP_STATUS from '~/constants/httpStatus';
import { wrap } from 'module';
import { wrapRequestHandler } from '~/utils/handlers';
import { NextFunction, Request, Response } from 'express';
import Tweet from '~/models/schemas/Tweet.schema';

const TweetTypeValues = numberEnumToArray(TweetType);
const AudienceValues = numberEnumToArray(TweetAudience);
const MediaTypes = numberEnumToArray(MediaType);
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [TweetTypeValues],
        errorMessage: TWEET_MESSAGE.INVALID_TYPE
      }
    },
    audience: {
      optional: true,
      isIn: {
        options: [AudienceValues],
        errorMessage: TWEET_MESSAGE.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType;
          if (
            ![TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            !ObjectId.isValid(value)
          ) {
            throw new Error(TWEET_MESSAGE.PARENT_ID_MUST_BE_A_VALID_TWEET_ID);
          }
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEET_MESSAGE.PARENT_ID_MUST_BE_NULL);
          }
          return true;
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType;
          const hashtags = req.body.hashtags as string[];
          const mentions = req.body.mentions as string[];
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_EMPTY_STRING);
          }
          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            isEmpty(mentions) &&
            isEmpty(hashtags) &&
            value === ''
          ) {
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_STRING);
          }
          return true;
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(TWEET_MESSAGE.HASHTAG_MUST_BE_ARRAY_STRING);
          }
          return true;
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEET_MESSAGE.MENTIONS_MUST_BE_ARRAY_OBJECT_ID);
          }
          return true;
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (
            !value.every((item: any) => {
              return item.url !== 'string' || !MediaTypes.includes(item.type);
            })
          ) {
            throw new Error(TWEET_MESSAGE.MEDIAS_MUST_BE_ARRAY_MEDIA_TYPE);
          }
          return true;
        }
      }
    }
  })
);

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGE.OBJECT_ID_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value as string)
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
                          cond: { $eq: ['$$item.type', 1] }
                        }
                      }
                    },
                    quoteTweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: { $eq: ['$$item.type', 2] }
                        }
                      }
                    },
                    commentTweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: { $eq: ['$$item.type', 3] }
                        }
                      }
                    },
                    views: {
                      $add: ['$guest_views', '$user_views']
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray();
            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGE.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              });
            }
            (req as Request).tweet = tweet;
            return true;
          }
        }
      }
    },
    ['body', 'params']
  )
);

export const audienceValidator = wrapRequestHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // lấy tweet từ middleware tweetIdValidator
    const tweet = req.tweet as Tweet;
    // check xem tweet có audience là TweetCircle không
    if (tweet.audience === TweetAudience.TwitterCircle) {
      // kiểm tra người dùng đã đăng nhập chưa
      if (!req.decode_authorization) {
        throw new ErrorWithStatus({
          message: TWEET_MESSAGE.AUTHORIZATION_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        });
      }
      // lấy tác giả của tweet
      const author = await databaseService.users.findOne({ _id: new ObjectId(tweet.user_id) });
      // kiểm tra xem có tweet có tác giả không và tác giả đó có bị banned không
      if (!author || author.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          message: TWEET_MESSAGE.USER_NOT_VERIFY,
          status: HTTP_STATUS.UNAUTHORIZED
        });
      }
      // Kiểm tra người xem tweet này có trong Twitter Circle của tác giả hay không
      const { user_id } = req.decode_authorization;
      const isInTweetCircle = author.tweet_circle.some((item) => item.equals(user_id));
      // Nếu bạn không phải tác giả và không có trong tweet Circle thì quăng lỗi
      if (!isInTweetCircle && !author._id.equals(user_id)) {
        throw new ErrorWithStatus({
          message: TWEET_MESSAGE.TWEET_IS_NOT_PUBLIC,
          status: HTTP_STATUS.FORBIDDEN
        });
      }
    }
    next();
  }
);
