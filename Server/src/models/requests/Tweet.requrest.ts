import { ParamsDictionary, Query } from 'express-serve-static-core';
import { TweetAudience, TweetType } from '~/constants/enums';
import { Media } from '../Order';

export interface TweetRequestBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | string;
  hashtags: string[];
  mentions: string[];
  medias: Media[];
}

export interface TweetParams extends ParamsDictionary {
  tweet_id: string;
}

export interface TweetQuery extends Query, Pagination {
  tweet_type: string;
}

export interface Pagination {
  page: string;
  limit: string;
}
