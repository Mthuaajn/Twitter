import { ParamsDictionary, Query } from 'express-serve-static-core';
import {
  MediaType,
  MediaTypeQuery,
  PeopleFollow,
  TweetAudience,
  TweetType
} from '~/constants/enums';
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

export interface SearchQuery extends Query, Pagination {
  content: string;
  media_type: MediaTypeQuery;
  people_follow: PeopleFollow;
}
