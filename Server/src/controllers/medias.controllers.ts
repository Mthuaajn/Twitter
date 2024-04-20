import { Request, Response } from 'express';
import path from 'path';
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const formidable = (await import('formidable')).default;
  const form = formidable({
    maxFiles: 1,
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFileSize: 300 * 1024 // 300kb
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err;
    }
  });
  res.json({
    message: 'Upload file success'
  });
};
