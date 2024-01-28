import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const { filename, contentType, folderPath } = await request.json();

  try {
    const client = new S3Client({ region: process.env.AWS_REGION });
    const key = folderPath ? `${folderPath}/${filename}` : filename;
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    });

    return Response.json({ url, fields });
  } catch (error) {
    return Response.json({ error: error });
  }
}
