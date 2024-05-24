import { getTweetChildrenController } from './../controllers/tweet.controllers';
import { isUserLoggedInValidator } from './../middlewares/users.middlewares';
import {
  createTweetValidator,
  tweetIdValidator,
  audienceValidator,
  tweetQueryValidator
} from './../middlewares/tweet.middlewares';
import { createTweetController, getTweetController } from '../controllers/tweet.controllers';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { verifyUserValidator } from '~/controllers/users.controllers';

const tweetRouter = Router();

tweetRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
);

tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
);

tweetRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  tweetQueryValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
);
export default tweetRouter;
