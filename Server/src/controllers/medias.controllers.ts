import { Request, Response } from 'express';
import { result } from 'lodash';
import path from 'path';
import HTTP_STATUS from '~/constants/httpStatus';
import { handleFileUploadImageSingle } from '~/utils/file';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await handleFileUploadImageSingle(req);
  return res.status(HTTP_STATUS.OK).json({
    result: data
  });
};
