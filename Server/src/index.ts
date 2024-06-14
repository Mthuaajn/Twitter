import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express, { Application } from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
import mediaRouter from '~/routes/medias.routes';
import { initFileUpload } from '~/utils/file';
import { config } from 'dotenv';
import { UPLOAD_IMAGE_DIR } from './constants/dir';
import staticRouter from './routes/static.routes';
import tweetRouter from './routes/tweet.routes';
import bookMarkRouter from './routes/bookmark.routes';
import likeRouter from './routes/like.routes';
import searchRouter from './routes/search.routes';
import morgan from 'morgan';
import cors from 'cors';
import '~/utils/S3';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import databaseService from '~/services/db.services';
import Conversation from './models/schemas/Conversation.chemas';
import { ObjectId } from 'mongodb';
// import '~/utils/fake';
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
  private httpServer: any;
  private io: any;
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
    this.setup();
  }
  private setupSocket(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected with id ${socket.id}`);
      // nhan biet client co tat connect khong
      const user_id = socket.handshake.auth._id as string;
      this.users[user_id] = {
        socket_id: socket.id
      };
      console.log(this.users);

      socket.on('private message', async (data) => {
        const receiver_socket_id = this.users[data.to]?.socket_id;
        if (!receiver_socket_id) return;
        socket.to(receiver_socket_id).emit('receive private message', {
          content: data.content,
          from: user_id
        });

        await databaseService.conversation.insertOne(
          new Conversation({
            sender_id: new ObjectId(data.to),
            receiver_id: new ObjectId(data.from),
            content: data.content
          })
        );
      });

      socket.on('disconnect', () => {
        delete this.users[user_id];
        console.log(`User disconnected with id ${socket.id}`);
        console.log(this.users);
      });
    });
  }
  private setup(): void {
    initFileUpload();
    // this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(
      cors({
        origin: 'http://localhost:3000'
      })
    );
    this.app.use('/medias', express.static(UPLOAD_VIDEO_DIR));
    this.app.use('/api/v1/users', this.userRouter);
    this.app.use('/api/v1/media', this.mediaRouter);
    this.app.use('/api/v1/static', this.staticRouter);
    this.app.use('/api/v1/tweets', this.tweetRouter);
    this.app.use('/api/v1/bookmarks', this.bookMarkRouter);
    this.app.use('/api/v1/search', this.searchRouter);
    this.app.use('/api/v1/likes', this.likeRouter);
    this.app.use('*', defaultErrorHandlers);
    this.setupSocket();
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
