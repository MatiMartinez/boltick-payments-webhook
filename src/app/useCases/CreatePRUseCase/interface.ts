import { PREntity } from "@domain/entities/PREntity";

export interface ICreatePRUseCase {
  execute(input: CreatePRInput): Promise<CreatePROutput>;
}

export type CreatePRInput = Pick<PREntity, "email" | "name" | "phone" | "photo" | "producer">;

export interface CreatePROutput {
  success: number;
  message: string;
  data?: PREntity;
}
