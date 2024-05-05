import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir';
import { Response, Request } from 'express';
import path from 'path';
import fs from 'fs';
import HTTP_STATUS from '~/constants/httpStatus';

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

export const serveVideoStreamController = async (req: Request, res: Response) => {
  const range = req.headers.range;
  console.log('range', range);
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header');
  }

  const { name } = req.params;
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);
  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 10 ** 6;
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + chunkSize, videoSize);
  const contentLength = end - start;
  const contentType = (await import('mime')).default.getType(videoPath) || 'video/*';
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  };
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};
