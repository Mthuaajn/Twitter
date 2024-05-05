import { UPLOAD_DIR } from '~/constants/dir';
import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express, { Application } from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
import mediaRouter from '~/routes/medias.routes';
import { initFileUpload } from '~/utils/file';
import { config } from 'dotenv';
import { UPLOAD_IMAGE_DIR } from './constants/dir';
import staticRouter from './routes/static.routes';
config();
export class App {
  private port: number = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  private app: Application;
  private userRouter = userRouter;
  private mediaRouter = mediaRouter;
  private staticRouter = staticRouter;
  constructor() {
    this.app = express();
    this.setup();
  }
  private setup(): void {
    initFileUpload();
    this.app.use(express.json());
    this.app.use('/medias', express.static(UPLOAD_DIR));
    this.app.use('/api/v1/users', this.userRouter);
    this.app.use('/api/v1/media', this.mediaRouter);
    this.app.use('/api/v1/static', this.staticRouter);
    this.app.use('*', defaultErrorHandlers);
  }
  public async start(): Promise<void> {
    try {
      await DatabaseService.run().catch(console.dir);
      this.app.listen(this.port, () => {
        console.log(`app running on port ${this.port}`);
      });
    } catch (err) {
      console.log('Error starting app ', err);
    }
  }
}

const myApp = new App();
myApp.start();