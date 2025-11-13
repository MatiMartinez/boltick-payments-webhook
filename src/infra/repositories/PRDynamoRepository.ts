import { PRModel } from "@models/PRModel";
import { PREntity } from "@domain/entities/PREntity";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { ILogger } from "@commons/Logger/interface";

export class PRDynamoRepository implements IPRRepository {
  constructor(private Logger: ILogger) {}

  async createPR(pr: PREntity): Promise<PREntity> {
    try {
      return await PRModel.create(pr);
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al crear el PR", { error: (error as Error).message });
      throw error;
    }
  }

  async getPRsByProducer(producer: string): Promise<PREntity[]> {
    try {
      const response = await PRModel.query("producer").eq(producer).exec();
      return response as unknown as PREntity[];
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al obtener los PRs por producer", { error: (error as Error).message });
      throw error;
    }
  }

  async updatePR(producer: string, id: string, data: Partial<Omit<PREntity, "producer" | "id" | "createdAt">>): Promise<PREntity> {
    try {
      return await PRModel.update({ producer, id }, data);
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al actualizar el PR", { error: (error as Error).message });
      throw error;
    }
  }
}
