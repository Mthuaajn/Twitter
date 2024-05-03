import { Request, Response } from 'express';
import { File } from 'formidable';
import { result } from 'lodash';
import path from 'path';
import HTTP_STATUS from '~/constants/httpStatus';
import mediasService from '~/services/medias.services';
import { handleFileUploadImageSingle } from '~/utils/file';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadSingleImage(req);
  return res.status(HTTP_STATUS.OK).json({
    message: 'Upload image single successfully',
    result: result
  });
};
