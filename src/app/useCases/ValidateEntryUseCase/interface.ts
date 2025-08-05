export interface IValidateEntryUseCase {
  execute(input: IValidateEntryUseCaseInput): Promise<IValidateEntryUseCaseOutput>;
}

export interface IValidateEntryUseCaseInput {
  token: string;
}

export interface IValidateEntryUseCaseOutput {
  result: number;
  message: string;
}
