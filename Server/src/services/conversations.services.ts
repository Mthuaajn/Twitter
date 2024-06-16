import { ObjectId } from 'mongodb';
import databaseService from './db.services';

class ConversationService {
  async conversation({
    sender_id,
    receiver_id,
    page,
    limit
  }: {
    sender_id: string;
    receiver_id: string;
    page: number;
    limit: number;
  }) {
    const match = {
      $or: [
        { sender_id: new ObjectId(sender_id), receiver_id: new ObjectId(receiver_id) },
        { sender_id: new ObjectId(receiver_id), receiver_id: new ObjectId(sender_id) }
      ]
    };
    const conversations = await databaseService.conversation
      .find(match)
      .sort({ create_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray();
    const total = await databaseService.conversation.countDocuments(match);

    return {
      conversations,
      total
    };
  }
}

const conversationService = new ConversationService();
export default conversationService;
