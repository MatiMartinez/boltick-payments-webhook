export interface ISolanaService {
  mintNFT(
    userAddress: string,
    nft: NFT,
    collectionName: string
  ): Promise<Token>;
}

export interface NFT {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
}
