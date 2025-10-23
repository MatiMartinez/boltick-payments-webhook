export interface ISolanaService {
  mintNFT(userAddress: string, nft: NFT, collectionName: string): Promise<Token>;
  mintBOLT(toAddress: string, amount: number): void;
}

export interface NFT {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
}
