import { UPLOAD_VIDEO_DIR } from './../constants/dir';
import { Media } from './../models/Order';
import { getNameFormFullname, handleFileUploadImage, handleFileUploadVideo } from '~/utils/file';
import { Request } from 'express';
import path from 'path';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir';
import sharp from 'sharp';
import fs from 'fs';
import { isProduction } from '~/constants/config';
import { config } from 'dotenv';
import { MediaType } from '~/constants/enums';
config();
class MediasService {
  async uploadImage(req: Request) {
    const files = await handleFileUploadImage(req);
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullname(file.newFilename);
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`);
        await sharp(file.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(file.filepath);
        return {
          url: isProduction
            ? `${process.env.HOST}/api/v1/static/upload-image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/api/v1/static/upload-image/${newName}.jpg`,
          type: MediaType.Image
        };
      })
    );
    return result;
  }
  async uploadVideo(req: Request) {
    const files = await handleFileUploadVideo(req);
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/api/v1/static/upload-video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/api/v1/static/upload-video/${file.newFilename}`,
        type: MediaType.Image
      };
    });
    return result;
  }
}
const mediasService = new MediasService();
export default mediasService;