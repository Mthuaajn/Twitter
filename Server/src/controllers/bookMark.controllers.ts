import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { BOOKMARK_MESSAGE } from '~/constants/messages';
import { BookMarkTweetReq } from '~/models/requests/BookMark.request';
import { TokenPayload } from '~/models/requests/User.request';
import bookMarkService from '~/services/bookmarks.serices';

export const createBookMarkController = async (
  req: Request<ParamsDictionary, any, BookMarkTweetReq>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await bookMarkService.createBookMark(user_id, req.body.tweet_id);
  res.json({
    message: BOOKMARK_MESSAGE.BOOKMARK_CREATED,
    result
  });
};

export const unBookMarkController = async (
  req: Request<ParamsDictionary, any, BookMarkTweetReq>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const result = await bookMarkService.unBookMark(user_id, req.params.tweetId);
  if (!result) {
    return res.json({ message: 'Bookmark not found' });
  }
  res.json({
    message: 'Bookmark deleted successfully'
  });
};
