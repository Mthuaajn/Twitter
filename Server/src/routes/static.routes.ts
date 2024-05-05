import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { serveImageController, serveVideoStreamController } from '~/controllers/static.controllers';

const staticRouter = Router();

staticRouter.get('/upload-image/:name', serveImageController);
staticRouter.get('/video-stream/:name', wrapRequestHandler(serveVideoStreamController));
export default staticRouter;
