import { PREntity } from "@domain/entities/PREntity";

export interface IUpdatePRUseCase {
  execute(input: UpdatePRInput): Promise<UpdatePROutput>;
}

export type UpdatePRInput = Pick<PREntity, "email" | "id" | "name" | "phone" | "photo" | "producer">;

export interface UpdatePROutput {
  success: number;
  message: string;
  data?: PREntity;
}
