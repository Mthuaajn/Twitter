import { S3, S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
config();

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
});

export const uploadFileToS3 = ({
  fileName,
  filePath,
  contentType
}: {
  fileName: string;
  filePath: string;
  contentType: string;
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: 'tweet-clone-2023',
      Key: fileName,
      Body: fs.readFileSync(filePath),
      ContentType: contentType
    }, // bucket la cai bucket tao tren aws
    // key la ten file upload
    // body thi chon buffer la file minh upload len
    // optional tags
    // bo sung contentType de khong bi download anh ve ma co the xem tren trinh duyet

    tags: [
      /*...*/
    ],

    queueSize: 4,
    partSize: 1024 * 1024 * 5,

    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false
  });
  return parallelUploads3.done();
};

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress);
// });

// parallelUploads3.done().then((res) => {
//   console.log(res);
// });
