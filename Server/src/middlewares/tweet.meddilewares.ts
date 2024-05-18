import { MediaType, TweetAudience, TweetType } from './../constants/enums';
import { numberEnumToArray } from './../utils/commons';
import { checkSchema } from 'express-validator';
import { validate } from './../utils/validation';
import { TWEET_MESSAGE } from '~/constants/messages';
import { ObjectId } from 'mongodb';
import { isEmpty } from 'lodash';

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
            [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            ObjectId.isValid(value)
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
          if (!value.every((item: any) => !ObjectId.isValid(item))) {
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
