import { S3Client, PutObjectCommand, GetObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import { IS3Service } from "./interface";

export class S3Service implements IS3Service {
  private S3Client: S3Client;

  constructor() {
    this.S3Client = new S3Client({ region: "us-east-1" });
  }

  async uploadFile(bucketName: string, fileKey: string, metadata: Record<string, any>) {
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

      console.log(`Metadata successfully uploaded to S3 at ${bucketName}/${fileKey}`);
    } catch (error) {
      console.error("[S3Service.uploadFile] Error uploading file to S3:", error);
      throw error;
    }
  }

  async getFile(bucketName: string, fileKey: string): Promise<Record<string, any>> {
    try {
      const params = {
        Bucket: bucketName,
        Key: fileKey,
      };

      const response = await this.S3Client.send(new GetObjectCommand(params));

      if (!response.Body) {
        throw new Error("No content found in S3 object");
      }

      const content = await response.Body.transformToString();
      return JSON.parse(content);
    } catch (error) {
      console.error("[S3Service.getFile] Error getting file from S3:", error);
      throw error;
    }
  }

  async updateFile(bucketName: string, fileKey: string, metadata: Record<string, any>): Promise<void> {
    try {
      await this.uploadFile(bucketName, fileKey, metadata);
    } catch (error) {
      console.error("[S3Service.updateFile] Error updating file in S3:", error);
      throw error;
    }
  }
}
