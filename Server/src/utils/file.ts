import { Request } from 'express';
import fs from 'fs';
import path from 'path';
export const initFileUpload = async () => {
  const uploadFolderPath = path.resolve('uploads');
  if (!fs.existsSync(uploadFolderPath)) {
    console.log('create file upload folder success');
    fs.mkdirSync(uploadFolderPath, { recursive: true });
  }
};

export const handleFileUploadImageSingle = async (req: Request) => {
  const formidable = (await import('formidable')).default;
  const form = formidable({
    maxFiles: 1,
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300kb,
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image/'));
      if (!isValid) {
        form.emit('err' as any, new Error('file type is not valid') as any);
      }
      return isValid;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('file is empty'));
      }
      return resolve(files);
    });
  });
};
