export interface IValidateManualEntryUseCase {
  execute(input: IValidateManualEntryUseCaseInput): Promise<IValidateManualEntryUseCaseOutput>;
}

export interface IValidateManualEntryUseCaseInput {
  ticketNumber: string;
}

export interface IValidateManualEntryUseCaseOutput {
  result: number;
  message: string;
  data?: {
    ticketNumber: string;
  };
}
