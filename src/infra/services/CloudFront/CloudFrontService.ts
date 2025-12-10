import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { ICloudFrontService, InvalidarPathsPayload } from "./interface";

export class CloudFrontService implements ICloudFrontService {
  private readonly client: CloudFrontClient;

  constructor() {
    this.client = new CloudFrontClient({ region: "us-east-1" });
  }

  async invalidarPaths(payload: InvalidarPathsPayload): Promise<void> {
    const { distributionId, paths } = payload;

    if (!paths.length) {
      console.warn("No se proporcionaron rutas para invalidar.");
      return;
    }

    const params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
        CallerReference: `invalidate-${Date.now()}`,
      },
    };

    try {
      const command = new CreateInvalidationCommand(params);
      const result = await this.client.send(command);
    } catch (error) {
      console.error("Error al invalidar rutas en CloudFront:", error);
      throw new Error("Error invalidando rutas en CloudFront");
    }
  }
}
