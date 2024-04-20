import fs from 'fs';
import path from 'path';
export const initFileUpload = async () => {
  const uploadFolderPath = path.resolve('uploads');
  if (!fs.existsSync(uploadFolderPath)) {
    console.log('create file upload folder success');
    fs.mkdirSync(uploadFolderPath, { recursive: true });
  }
};
