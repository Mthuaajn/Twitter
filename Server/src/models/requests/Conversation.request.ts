import { ParamsDictionary } from 'express-serve-static-core';
export interface GetConversationRequest extends ParamsDictionary {
  receiver_id: string;
}
