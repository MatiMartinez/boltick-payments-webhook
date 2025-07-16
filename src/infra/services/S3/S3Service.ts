import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

import { IS3Service } from "./interface";

export class S3Service implements IS3Service {
  private S3Client: S3Client;

  constructor() {
    this.S3Client = new S3Client({ region: "us-east-1" });
  }

  async uploadFile(
    bucketName: string,
    fileKey: string,
    metadata: Record<string, any>
  ) {
    try {
      const fileContent = JSON.stringify(metadata);

      const params = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: "application/json",
        ACL: "private" as ObjectCannedACL,
      };

      await this.S3Client.send(new PutObjectCommand(params));

      console.log(
        `Metadata successfully uploaded to S3 at ${bucketName}/${fileKey}`
      );
    } catch (error) {
      const err = error as Error;
      console.log(err.message);
      throw new Error("Error uploading file to S3.");
    }
  }
}
