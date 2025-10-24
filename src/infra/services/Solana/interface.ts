export interface ISolanaService {
  mintNFT(userAddress: string, nft: NFT, collectionName: string): Promise<Token>;
  mintBOLT(toAddress: string, amount: number): Promise<string>;
  transferBOLT(fromAddress: string, toAddress: string, amount: number): Promise<string>;
  getCreatorKeypair(): any; // Retorna el Keypair de Solana
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
