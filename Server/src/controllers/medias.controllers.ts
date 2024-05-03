
import { Request, Response } from 'express';
import HTTP_STATUS from '~/constants/httpStatus';
import mediasService from '~/services/medias.services';
export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadImage(req);
  return res.status(HTTP_STATUS.OK).json({
    message: 'Upload image  successfully',
    result: result
  });
};
