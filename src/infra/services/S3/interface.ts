export interface IS3Service {
  uploadFile(bucketName: string, fileKey: string, metadata: Record<string, any>): Promise<void>;
  getFile(bucketName: string, fileKey: string): Promise<Record<string, any>>;
  updateFile(bucketName: string, fileKey: string, metadata: Record<string, any>): Promise<void>;
}
