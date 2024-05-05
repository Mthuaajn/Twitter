import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { serveImageController, serveVideoController } from '~/controllers/static.controllers';

const staticRouter = Router();

staticRouter.get('/upload-image/:name', serveImageController);
staticRouter.get('/upload-video/:name', serveVideoController);
export default staticRouter;
