import { Request } from 'express';
import { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { UPLOAD_TEMP_DIR } from '~/constants/dir';
export const initFileUpload = async () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    console.log('create file upload folder success');
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
  }
};

export const handleFileUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default;
  const form = formidable({
    maxFiles: 4,
    uploadDir: UPLOAD_TEMP_DIR,
    keepExtensions: true,
    maxFileSize: 4000 * 1024, // 4000kb,
    maxTotalFileSize: 4000 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image/'));
      if (!isValid) {
        form.emit('err' as any, new Error('file type is not valid') as any);
      }
      return isValid;
    }
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('file is empty'));
      }
      return resolve(files.image as File[]);
    });
  });
};

export const getNameFormFullname = (name: string) => {
  const nameArr = name.split('.');
  nameArr.pop();
  return nameArr.join('');
};
