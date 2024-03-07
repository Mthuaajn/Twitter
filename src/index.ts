import express, { NextFunction, Request, Response } from 'express';
import DatabaseService from '~/services/db.services';
import userRouter from '~/routes/users.routes';
const port = 3000;
const app = express();

DatabaseService.run().catch(console.dir);
app.use(express.json());
app.use('/api/v1/users', userRouter);
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
