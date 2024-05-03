import { getNameFormFullname, handleFileUploadImageSingle } from '~/utils/file';
import { Request } from 'express';
import path from 'path';
import { UPLOAD_DIR } from '~/constants/dir';
import sharp from 'sharp';
import fs from 'fs';
import { isProduction } from '~/constants/config';
import { config } from 'dotenv';
config();
class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleFileUploadImageSingle(req);
    const newName = getNameFormFullname(file.newFilename);
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    await sharp(file.filepath).jpeg().toFile(newPath);
    fs.unlinkSync(file.filepath);
    return isProduction
      ? `${process.env.HOST}/medias/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`;
  }
}
const mediasService = new MediasService();
export default mediasService;
