export interface ISendTokensUseCase {
  execute(input: SendTokensInput): Promise<boolean>;
}

export interface SendTokensInput {
  id: string;
}
