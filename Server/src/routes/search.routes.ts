import { paginationValidator } from '~/middlewares/tweet.middlewares';
import { getSearchController } from './../controllers/search.controller';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';

const searchRouter = Router();

searchRouter.get('/', wrapRequestHandler(getSearchController));

export default searchRouter;
