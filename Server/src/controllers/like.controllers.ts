import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { LIKE_MESSAGE } from '~/constants/messages';
import { LikeRequest } from '~/models/requests/Like.request';
import { TokenPayload } from '~/models/requests/User.request';
import likeService from '~/services/like.services';

export const createLikeController = async (
  req: Request<ParamsDictionary, any, LikeRequest>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await likeService.createLikeTweet(user_id, req.body.tweet_id);
  res.json({
    message: LIKE_MESSAGE.LIKE_CREATED,
    result
  });
};

export const deleteLikeController = async (
  req: Request<ParamsDictionary, any, LikeRequest>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  await likeService.unLike(user_id, req.params.tweet_id);
  res.json({
    message: LIKE_MESSAGE.LIKE_DELETED
  });
};
