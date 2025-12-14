import { DeletePRInput, DeletePROutput, IDeletePRUseCase } from "./interface";

import { ILogger } from "@commons/Logger/interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";

export class DeletePRUseCase implements IDeletePRUseCase {
  constructor(
    private PRRepository: IPRRepository,
    private Logger: ILogger
  ) {}

  async execute(input: DeletePRInput): Promise<DeletePROutput> {
    try {
      await this.PRRepository.delete(input.producer, input.id);
      return { success: 1, message: "PR eliminado correctamente" };
    } catch (error) {
      this.Logger.error("[DeletePRUseCase] Error al eliminar el PR", {
        error: (error as Error).message,
      });
      return { success: 0, message: "Error al eliminar el PR" };
    }
  }
}
