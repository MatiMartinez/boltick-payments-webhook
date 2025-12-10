import { IInvalidarCloudFrontUseCase, InvalidarCloudFrontInput, InvalidarCloudFrontOutput } from "./interface";
import { ICloudFrontService } from "@services/CloudFront/interface";
import { ILogger } from "@commons/Logger/interface";

export class InvalidarCloudFrontUseCase implements IInvalidarCloudFrontUseCase {
  constructor(
    private CloudFrontService: ICloudFrontService,
    private Logger: ILogger
  ) {}

  async execute(input: InvalidarCloudFrontInput): Promise<InvalidarCloudFrontOutput> {
    try {
      const { distributionId } = input;

      if (!distributionId || distributionId.trim() === "") {
        return { success: 0, message: "distributionId es requerido" };
      }

      const paths = ["/*"];
      await this.CloudFrontService.invalidarPaths({
        distributionId,
        paths,
      });

      return {
        success: 1,
        message: "Invalidación de CloudFront iniciada correctamente",
      };
    } catch (error) {
      this.Logger.error("[InvalidarCloudFrontUseCase] Error al invalidar CloudFront", {
        error: (error as Error).message,
      });
      return { success: 0, message: "Error al invalidar rutas en CloudFront" };
    }
  }
}
