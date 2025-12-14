import { PREntity } from "@domain/entities/PREntity";

export interface IPRRepository {
  createPR(pr: PREntity): Promise<PREntity>;
  getPRsByProducer(producer: string): Promise<PREntity[]>;
  updatePR(
    producer: string,
    id: string,
    data: Partial<Omit<PREntity, "producer" | "id" | "createdAt">>
  ): Promise<PREntity>;
  findByEmailAndProducer(email: string, producer: string): Promise<PREntity | null>;
  findByPhoneAndProducer(phone: string, producer: string): Promise<PREntity | null>;
  delete(producer: string, id: string): Promise<void>;
}
