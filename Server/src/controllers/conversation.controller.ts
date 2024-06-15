import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import conversationService from '~/services/conversations.services';
import { GetConversationRequest } from '~/models/requests/Conversation.request';

export const getConversationController = async (
  req: Request<GetConversationRequest>,
  res: Response
) => {
  const { receiver_id } = req.params;
  const sender_id = req.decode_authorization?.user_id as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 1;
  const result = await conversationService.conversation({
    sender_id,
    receiver_id,
    page,
    limit
  });
  res.status(200).json({
    message: 'Get conversation successfully',
    page,
    limit,
    total_page: Math.ceil(result.total / limit),
    conversations: result.conversations
  });
};
