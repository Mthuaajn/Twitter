import { Socket, Server } from 'socket.io';
import { UserVerifyStatus } from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGE } from '~/constants/messages';
import { TokenPayload } from '~/models/requests/User.request';
import User from '~/models/schemas/User.schema';
import { verifyAccessToken } from '~/utils/commons';
import { ErrorWithStatus } from '~/utils/Error';
import databaseService from './db.services';
import Conversation from '~/models/schemas/Conversation.chemas';
import { ObjectId } from 'mongodb';

class SocketService {
  private io: Server;
  private users: {
    [key: string]: {
      socket_id: string;
    };
  } = {};
  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupHandler();
  }
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      const { Authorization } = socket.handshake.auth;
      const access_token = Authorization.split(' ')[1];
      try {
        const decode_authorization = await verifyAccessToken(access_token);
        const { verify } = decode_authorization as TokenPayload;
        if (verify !== UserVerifyStatus.Verified) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.USER_NOT_VERIFY,
            status: HTTP_STATUS.FORBIDDEN
          });
        }
        socket.handshake.auth.decode_authorization = decode_authorization;
      } catch (err) {
        next({
          message: 'Unauthorized',
          name: 'UnauthorizedError',
          data: err
        });
      }
    });
  }
  private setupHandler(): void {
    console.log('Socket service is running');
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected with id ${socket.id}`);
      // nhan biet client co tat connect khong
      const { user_id } = socket.handshake.auth.decode_authorization as TokenPayload;
      this.users[user_id] = {
        socket_id: socket.id
      };
      console.log(this.users);

      socket.on('send_message', async (data) => {
        const { receiver_id, sender_id, content } = data.payload;
        const receiver_socket_id = this.users[receiver_id]?.socket_id;
        if (!receiver_socket_id) return;
        const conversation = new Conversation({
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id),
          content: content
        });
        const result = await databaseService.conversation.insertOne(conversation);
        conversation._id = result.insertedId;
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation
        });
      });

      socket.on('disconnect', () => {
        delete this.users[user_id];
        console.log(`User disconnected with id ${socket.id}`);
        console.log(this.users);
      });
    });
  }
}

export default SocketService;
