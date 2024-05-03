import { error } from 'console';
import { Response, Request } from 'express';
import path from 'path';
import { UPLOAD_DIR } from '~/constants/dir';

export const serveImageController = (req: Request, res: Response) => {
  const name = req.params.name;
  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      console.log(err);
      res.status(400).send('Image not found');
    }
  });
};
