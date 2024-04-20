import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { uploadSingleImageController } from '~/controllers/medias.controllers';

const mediaRouter = Router();

mediaRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController));

export default mediaRouter;
