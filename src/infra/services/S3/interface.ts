export interface IS3Service {
  uploadFile(
    bucketName: string,
    fileKey: string,
    metadata: Record<string, any>
  ): Promise<void>;
}
