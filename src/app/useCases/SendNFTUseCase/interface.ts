export interface ISendNFTUseCase {
  execute(input: SendNFTInput): Promise<boolean>;
}

export interface SendNFTInput {
  id: string;
  nftId: string;
}
