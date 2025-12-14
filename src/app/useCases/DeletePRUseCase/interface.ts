export interface IDeletePRUseCase {
  execute(input: DeletePRInput): Promise<DeletePROutput>;
}

export interface DeletePRInput {
  producer: string;
  id: string;
}

export interface DeletePROutput {
  success: number;
  message: string;
}
