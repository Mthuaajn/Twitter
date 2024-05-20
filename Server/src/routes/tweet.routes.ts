import { isUserLoggedInValidator } from './../middlewares/users.middlewares';
import { createTweetValidator, tweetIdValidator } from './../middlewares/tweet.middlewares';
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
  wrapRequestHandler(getTweetController)
);
export default tweetRouter;
