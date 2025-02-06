import { NFT } from '@domain/Payment';

export interface SendNFTDTO {
  id: string;
  nft: NFT;
  paymentId: string;
  userAddress: string;
}
