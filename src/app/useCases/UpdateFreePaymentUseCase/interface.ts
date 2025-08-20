export interface IUpdateFreePaymentUseCase {
  execute(input: IUpdateFreePaymentUseCaseInput): Promise<IUpdateFreePaymentUseCaseOutput>;
}

export interface IUpdateFreePaymentUseCaseInput {
  id: string;
}

export interface IUpdateFreePaymentUseCaseOutput {
  success: boolean;
  message: string;
}
