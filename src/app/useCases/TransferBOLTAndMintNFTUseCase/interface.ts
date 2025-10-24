export interface ITransferBOLTAndMintNFTUseCase {
  execute(input: ITransferBOLTAndMintNFTUseCaseInput): Promise<boolean>;
}

export interface ITransferBOLTAndMintNFTUseCaseInput {
  eventId: string;
  ticketTypeId: string;
  walletAddress: string;
  userId: string;
}
