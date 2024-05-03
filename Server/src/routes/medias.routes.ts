import { uploadImageController } from '~/controllers/medias.controllers';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
const mediaRouter = Router();

mediaRouter.post('/upload-image', wrapRequestHandler(uploadImageController));

export default mediaRouter;
