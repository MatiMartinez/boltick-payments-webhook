import { ILogger } from "@commons/Logger/interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { PREntity } from "@domain/entities/PREntity";
import { PRModel } from "@models/PRModel";

export class PRDynamoRepository implements IPRRepository {
  constructor(private Logger: ILogger) {}

  async createPR(pr: PREntity): Promise<PREntity> {
    try {
      return await PRModel.create(pr);
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al crear el PR", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async getPRsByProducer(producer: string): Promise<PREntity[]> {
    try {
      const response = await PRModel.query("producer").eq(producer).exec();
      return response as unknown as PREntity[];
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al obtener los PRs por producer", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async updatePR(
    producer: string,
    id: string,
    data: Partial<Omit<PREntity, "producer" | "id" | "createdAt">>
  ): Promise<PREntity> {
    try {
      return await PRModel.update({ producer, id }, data);
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al actualizar el PR", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async findByEmailAndProducer(email: string, producer: string): Promise<PREntity | null> {
    try {
      const response = await PRModel.query("producer")
        .eq(producer)
        .filter("email")
        .eq(email)
        .exec();
      return response.length > 0 ? (response[0] as unknown as PREntity) : null;
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al buscar PR por email y producer", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async findByPhoneAndProducer(phone: string, producer: string): Promise<PREntity | null> {
    try {
      const response = await PRModel.query("producer")
        .eq(producer)
        .filter("phone")
        .eq(phone)
        .exec();
      return response.length > 0 ? (response[0] as unknown as PREntity) : null;
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al buscar PR por phone y producer", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async delete(producer: string, id: string): Promise<void> {
    try {
      await PRModel.delete({ producer, id });
    } catch (error) {
      this.Logger.error("[PRDynamoRepository] Error al eliminar el PR", {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
