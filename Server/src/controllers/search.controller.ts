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
  const content = req.query.content as string;
  const result = await searchService.search({ page, limit, content });
  res.status(200).json({
    message: 'search successful',
    result
  });
};
