import { UPLOAD_VIDEO_TEMP_DIR, UPLOAD_VIDEO_DIR } from './../constants/dir';
import { Request } from 'express';
import { File } from 'formidable';
import fs from 'fs';
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_DIR } from '~/constants/dir';
export const initFileUpload = async () => {
  [UPLOAD_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      console.log('create folder success');
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

export const handleFileUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default;
  const form = formidable({
    maxFiles: 4,
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
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

export const handleFileUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default;
  const form = formidable({
    maxFiles: 1,
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFileSize: 50 * 1024 * 1024, // 4000kb,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid =
        name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'));
      if (!valid) {
        form.emit('err' as any, new Error('file type is not valid') as any);
      }
      return valid;
    }
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('file is empty'));
      }
      const videos = files.video as File[];
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string);
        fs.renameSync(video.filepath, video.filepath + '.' + ext);
        video.newFilename = video.newFilename + '.' + ext;
      });
      return resolve(files.video as File[]);
    });
  });
};

export const getNameFormFullname = (name: string) => {
  const nameArr = name.split('.');
  nameArr.pop();
  return nameArr.join('');
};

export const getExtension = (name: string) => {
  const nameArr = name.split('.');
  return nameArr[nameArr.length - 1];
};
