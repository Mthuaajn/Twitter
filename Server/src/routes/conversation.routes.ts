import { getConversationController } from '~/controllers/conversation.controller';
import { verifyUserValidator } from './../controllers/users.controllers';
import {
  accessTokenValidator,
  getConversationsValidator
} from './../middlewares/users.middlewares';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { paginationValidator } from '~/middlewares/tweet.middlewares';
const conversationsRouter = Router();

conversationsRouter.get(
  '/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapRequestHandler(getConversationController)
);

export default conversationsRouter;
