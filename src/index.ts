import { defaultErrorHandlers } from './middlewares/error.middlewares';
import express, { Application } from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
export class App {
  private port: number = 3000;
  private app: Application;
  private userRouter = userRouter;
  constructor() {
    this.app = express();
    this.setup();
  }
  private setup(): void {
    this.app.use(express.json());
    this.app.use('/api/v1/users', this.userRouter);
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
