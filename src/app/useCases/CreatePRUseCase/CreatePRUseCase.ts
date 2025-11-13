import { v4 as uuidv4 } from "uuid";
import { ICreatePRUseCase, CreatePRInput, CreatePROutput } from "./interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { ILogger } from "@commons/Logger/interface";
import { PREntity } from "@domain/entities/PREntity";

export class CreatePRUseCase implements ICreatePRUseCase {
  constructor(
    private PRRepository: IPRRepository,
    private Logger: ILogger
  ) {}

  async execute(input: CreatePRInput): Promise<CreatePROutput> {
    try {
      const now = new Date().getTime();
      const pr: PREntity = {
        ...input,
        slug: this.slugify(input.name),
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };

      const createdPR = await this.PRRepository.createPR(pr);
      return { success: 1, message: "PR creado correctamente", data: createdPR };
    } catch (error) {
      this.Logger.error("[CreatePRUseCase] Error al crear el PR", { error: (error as Error).message });
      return { success: 0, message: "Error al crear el PR" };
    }
  }

  private slugify(name: string): string {
    return name.toLowerCase().replace(/ /g, "-");
  }
}
