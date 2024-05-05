import { verifyUserValidator } from './../controllers/users.controllers';
import { accessTokenValidator } from './../middlewares/users.middlewares';
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
const mediaRouter = Router();

mediaRouter.post('/upload-image', wrapRequestHandler(uploadImageController));
mediaRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(uploadVideoController)
);

export default mediaRouter;
