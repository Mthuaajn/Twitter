import { Media } from './../models/Order';
import { getNameFormFullname, handleFileUploadImage } from '~/utils/file';
import { Request } from 'express';
import path from 'path';
import { UPLOAD_DIR } from '~/constants/dir';
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
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
        await sharp(file.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(file.filepath);
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`,
          type: MediaType.Image
        };
      })
    );
    return result;
  }
}
const mediasService = new MediasService();
export default mediasService;
