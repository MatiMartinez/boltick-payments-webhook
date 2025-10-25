export interface ITransferBOLTAndMintNFTUseCase {
  execute(input: ITransferBOLTAndMintNFTUseCaseInput): Promise<boolean>;
}

export interface ITransferBOLTAndMintNFTUseCaseInput {
  transferId: string;
}
