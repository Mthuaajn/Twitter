import { getConversationController } from '~/controllers/conversation.controller';
import { verifyUserValidator } from './../controllers/users.controllers';
import { accessTokenValidator } from './../middlewares/users.middlewares';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
const conversationsRouter = Router();

conversationsRouter.get(
  '/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getConversationController)
);

export default conversationsRouter;
