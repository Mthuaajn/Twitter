import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from './../constants/dir';

import { Response, Request } from 'express';
import path from 'path';

export const serveImageController = (req: Request, res: Response) => {
  const name = req.params.name;
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      console.log(err);
      res.status((err as any).status).send('not found');
    } else {
      res.end();
    }
  });
};

export const serveVideoController = (req: Request, res: Response) => {
  const name = req.params.name;
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if (err) {
      console.log(err);
      res.status((err as any).status).send('not found');
    } else {
      res.end();
    }
  });
};
