import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { serveImageController } from '~/controllers/static.controllers';

const staticRouter = Router();

staticRouter.get('/upload-image/:name', serveImageController);
export default staticRouter;
