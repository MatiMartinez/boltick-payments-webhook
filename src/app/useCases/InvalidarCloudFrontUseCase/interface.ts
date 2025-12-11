export interface IInvalidarCloudFrontUseCase {
  execute(): Promise<InvalidarCloudFrontOutput>;
}

export interface InvalidarCloudFrontOutput {
  success: number;
  message: string;
}
