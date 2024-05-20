import {
  createBookMarkController,
  unBookMarkController
} from './../controllers/bookMark.controllers';
import { verifyUserValidator } from './../controllers/users.controllers';
import { accessTokenValidator } from './../middlewares/users.middlewares';
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
const bookMarkRouter = Router();

bookMarkRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(createBookMarkController)
);

bookMarkRouter.delete(
  '/tweets/:tweetId',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(unBookMarkController)
);
export default bookMarkRouter;
