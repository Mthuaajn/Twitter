import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { TweetRequestBody } from '~/models/requests/Tweet.requrest';
import { TokenPayload } from '~/models/requests/User.request';
import tweetService from '~/services/tweet.services';
import { TWEET_MESSAGE } from '~/constants/messages';

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
