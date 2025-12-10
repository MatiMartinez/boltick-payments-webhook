export interface IInvalidarCloudFrontUseCase {
  execute(input: InvalidarCloudFrontInput): Promise<InvalidarCloudFrontOutput>;
}

export type InvalidarCloudFrontInput = {
  distributionId: string;
};

export interface InvalidarCloudFrontOutput {
  success: number;
  message: string;
}
