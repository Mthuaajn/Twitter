import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { TweetRequestBody } from '~/models/requests/Tweet.requrest';
import { TokenPayload } from '~/models/requests/User.request';
import tweetService from '~/services/tweet.services';
import { TWEET_MESSAGE } from '~/constants/messages';
import Tweet from '~/models/schemas/Tweet.schema';
import { TweetType } from '~/constants/enums';

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await tweetService.createTweet(user_id, req.body);
  res.json({ message: TWEET_MESSAGE.CREATED, result });
};

export const getTweetController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const result = await tweetService.increaseTweetViews(
    req.params.tweet_id,
    req.decode_authorization?.user_id as string
  );

  const tweet = {
    ...req.tweet,
    user_views: result?.user_views,
    guest_views: result?.guest_views
  };

  res.json({
    message: TWEET_MESSAGE.GET_TWEET_SUCCESS,
    result: tweet
  });
};

export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const page = Number(req.query.page as string);
  const limit = Number(req.query.limit as string);
  const tweet_type = Number(req.query.type as string) as TweetType;
  const { tweets, totalDocument } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    page,
    limit,
    tweet_type
  });
  res.json({
    message: TWEET_MESSAGE.TWEET_CHILDREN_SUCCESS,
    result: {
      tweet_type,
      page,
      limit,
      totalPage: Math.ceil(totalDocument / limit),
      totalDocument,
      tweets
    }
  });
};
