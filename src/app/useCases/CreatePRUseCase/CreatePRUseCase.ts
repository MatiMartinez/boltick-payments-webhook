import { CreatePRInput, CreatePROutput, ICreatePRUseCase } from "./interface";

import { ILogger } from "@commons/Logger/interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { PREntity } from "@domain/entities/PREntity";
import { v4 as uuidv4 } from "uuid";

export class CreatePRUseCase implements ICreatePRUseCase {
  constructor(
    private PRRepository: IPRRepository,
    private Logger: ILogger
  ) {}

  async execute(input: CreatePRInput): Promise<CreatePROutput> {
    try {
      // Validar duplicados por email o phone
      const [existingByEmail, existingByPhone] = await Promise.all([
        this.PRRepository.findByEmailAndProducer(input.email, input.producer),
        this.PRRepository.findByPhoneAndProducer(input.phone, input.producer),
      ]);

      if (existingByEmail || existingByPhone) {
        return { success: 0, message: "PR ya existe para este productor" };
      }

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
      this.Logger.error("[CreatePRUseCase] Error al crear el PR", {
        error: (error as Error).message,
      });
      return { success: 0, message: "Error al crear el PR" };
    }
  }

  private slugify(name: string): string {
    return name.toLowerCase().replace(/ /g, "-");
  }
}
