import { createTweetValidator } from './../middlewares/tweet.meddilewares';
import { createTweetController } from '../controllers/tweet.controllers';
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
export default tweetRouter;
