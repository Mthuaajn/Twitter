import { registerValidator } from './../middlewares/users.middlewares';
import { validate } from './../utils/validation';
import { Router } from 'express';
import { loginController, registerController } from '~/controllers/users.controllers';

const userRouter = Router();

userRouter.post('/login', loginController);
// tạo checkSchema để kiểm tra dữ liệu đầu vào
userRouter.post('/register', registerValidator, registerController);

export default userRouter;
