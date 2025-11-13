import { IUpdatePRUseCase, UpdatePRInput, UpdatePROutput } from "./interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { ILogger } from "@commons/Logger/interface";

export class UpdatePRUseCase implements IUpdatePRUseCase {
  constructor(
    private PRRepository: IPRRepository,
    private Logger: ILogger
  ) {}

  async execute(input: UpdatePRInput): Promise<UpdatePROutput> {
    try {
      const { producer, id, ...updateData } = input;
      const updatePayload = {
        ...updateData,
        slug: this.slugify(updateData.name),
        updatedAt: new Date().getTime(),
      };

      const updatedPR = await this.PRRepository.updatePR(producer, id, updatePayload);
      return { success: 1, message: "PR actualizado correctamente", data: updatedPR };
    } catch (error) {
      this.Logger.error("[UpdatePRUseCase] Error al actualizar el PR", { error: (error as Error).message });
      return { success: 0, message: "Error al actualizar el PR" };
    }
  }

  private slugify(name: string): string {
    return name.toLowerCase().replace(/ /g, "-");
  }
}
