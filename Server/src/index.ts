import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express, { Application } from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
import mediaRouter from '~/routes/medias.routes';
import { initFileUpload } from '~/utils/file';
import { config } from 'dotenv';
import staticRouter from './routes/static.routes';
import tweetRouter from './routes/tweet.routes';
import bookMarkRouter from './routes/bookmark.routes';
import likeRouter from './routes/like.routes';
import searchRouter from './routes/search.routes';
import conversationRouter from '~/routes/conversation.routes';
import morgan from 'morgan';
import cors from 'cors';
import '~/utils/S3';
import { createServer, Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import SocketService from './services/socket.services';
// import '~/utils/fake';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import YAMLJS from 'yamljs';
config();
export class App {
  private port: number = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  private app: Application;
  private userRouter = userRouter;
  private mediaRouter = mediaRouter;
  private staticRouter = staticRouter;
  private tweetRouter = tweetRouter;
  private bookMarkRouter = bookMarkRouter;
  private likeRouter = likeRouter;
  private searchRouter = searchRouter;
  private conversationRouter = conversationRouter;
  private httpServer: HTTPServer;
  private io: Server;
  private socketService: SocketService;
  // private swaggerDocument: any;
  private openapiSpecification: object;
  private users: {
    [key: string]: {
      socket_id: string;
    };
  } = {};
  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: 'http://localhost:3000'
      }
    });
    // const file = fs.readFileSync(path.resolve('./tweet-clone_swagger.yaml'), 'utf8');
    // this.swaggerDocument = YAML.parse(file);
    const info = YAMLJS.load(path.resolve('./open_api/info.yaml'));
    const components = YAMLJS.load(path.resolve('./open_api/components.yaml'));
    const paths = YAMLJS.load(path.resolve('./open_api/paths.yaml'));
    const options: swaggerJsdoc.Options = {
      definition: {
        openapi: '3.0.3',
        ...info,
        paths: paths.paths,
        components: components.components
      },
      apis: ['./open_api/*.yaml', './routes/*.ts'] // files containing annotations as above
    };

    this.openapiSpecification = swaggerJsdoc(options);
    this.socketService = new SocketService(this.io); // khởi tạo socketService
    this.setup();
  }
  private setup(): void {
    initFileUpload();
    // this.app.use(morgan('dev'));
    this.app.use(express.json());
    // this.app.use(
    //   cors({
    //     origin: 'http://localhost:3000'
    //   })
    // );
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.openapiSpecification));
    this.app.use('/medias', express.static(UPLOAD_VIDEO_DIR));
    this.app.use('/api/v1/users', this.userRouter);
    this.app.use('/api/v1/media', this.mediaRouter);
    this.app.use('/api/v1/static', this.staticRouter);
    this.app.use('/api/v1/tweets', this.tweetRouter);
    this.app.use('/api/v1/bookmarks', this.bookMarkRouter);
    this.app.use('/api/v1/search', this.searchRouter);
    this.app.use('/api/v1/likes', this.likeRouter);
    this.app.use('/api/v1/conversations', this.conversationRouter);
    this.app.use('*', defaultErrorHandlers);
    this.socketService.setupMiddleware();
    this.socketService.setupHandler(this.users);
  }
  public async start(): Promise<void> {
    try {
      await DatabaseService.run().then(() => {
        DatabaseService.getIndex();
      });
      this.httpServer.listen(this.port, () => {
        console.log(`app running on port ${this.port}`);
      });
    } catch (err) {
      console.log('Error starting app ', err);
    }
  }
}

const myApp = new App();
myApp.start();
