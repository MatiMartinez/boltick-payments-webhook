import { IGetPRsByProducerUseCase, GetPRsByProducerOutput } from "./interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { ILogger } from "@commons/Logger/interface";

export class GetPRsByProducerUseCase implements IGetPRsByProducerUseCase {
  constructor(
    private PRRepository: IPRRepository,
    private Logger: ILogger
  ) {}

  async execute(producer: string): Promise<GetPRsByProducerOutput> {
    try {
      const prs = await this.PRRepository.getPRsByProducer(producer);
      return { success: 1, message: "PRs obtenidos correctamente", data: prs };
    } catch (error) {
      this.Logger.error("[GetPRsByProducerUseCase] Error al obtener los PRs", { error: (error as Error).message });
      return { success: 0, message: "Error al obtener los PRs" };
    }
  }
}
