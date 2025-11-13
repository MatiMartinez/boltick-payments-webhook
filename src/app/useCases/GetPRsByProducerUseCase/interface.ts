import { PREntity } from "@domain/entities/PREntity";

export interface IGetPRsByProducerUseCase {
  execute(producer: string): Promise<GetPRsByProducerOutput>;
}

export interface GetPRsByProducerOutput {
  success: number;
  message: string;
  data?: PREntity[];
}
