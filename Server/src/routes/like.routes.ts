import { createLikeController } from './../controllers/like.controllers';
import { verifyUserValidator } from '~/controllers/users.controllers';

import { Router } from 'express';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';
const likeRouter = Router();
likeRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(createLikeController)
);

export default likeRouter;
