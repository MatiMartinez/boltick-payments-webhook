export interface IUpdateFreePaymentUseCase {
  execute(input: string): Promise<IUpdateFreePaymentUseCaseOutput>;
}

export interface IUpdateFreePaymentUseCaseOutput {
  success: boolean;
  message: string;
}
