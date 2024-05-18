import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { TweetRequestBody } from '~/models/requests/Tweet.requrest';

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  res.status(200).json({ message: 'Tweet created' });
};
