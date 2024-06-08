import { paginationValidator } from '~/middlewares/tweet.middlewares';
import { getSearchController } from './../controllers/search.controller';
import { wrapRequestHandler } from './../utils/handlers';
import { Router } from 'express';
import { accessTokenValidator } from '~/middlewares/users.middlewares';
import { verifyUserValidator } from '~/controllers/users.controllers';
import { searchValidator } from '~/middlewares/search.middlewares';

const searchRouter = Router();

searchRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  searchValidator,
  paginationValidator,
  wrapRequestHandler(getSearchController)
);

export default searchRouter;
