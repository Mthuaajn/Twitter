import { SearchQuery } from './../models/requests/Tweet.request';
import { Request, Response } from 'express';
import { Pagination } from '../models/requests/Tweet.request';
import { ParamsDictionary } from 'express-serve-static-core';
import searchService from '~/services/search.services';

export const getSearchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const content = encodeURIComponent(req.query.content as string); // thuc hien encode content thanh ' ' -> %20
  const result = await searchService.search({
    page,
    limit,
    content,
    user_id: req.decode_authorization?.user_id as string,
    media_type: req.query?.media_type,
    people_follow: req.query?.people_follow
  });
  res.status(200).json({
    message: 'search successful',
    result: {
      tweets: result.tweets,
      page,
      limit,
      total_pages: Math.ceil(result.total / limit)
    }
  });
};
