import { Connection, clusterApiUrl, Keypair, PublicKey, Cluster } from '@solana/web3.js';
import { Metaplex, Nft, keypairIdentity } from '@metaplex-foundation/js';

import { NFT } from './interface';

export class SolanaService {
  private connection: Connection;

  constructor(cluster: Cluster) {
    this.connection = new Connection(clusterApiUrl(cluster), 'confirmed'); // testnet
  }

  async mintNFT(nft: NFT): Promise<Nft> {
    try {
      const privateWallet = this.getPrivateWallet();
      const collectionAddress = this.getCollectionAddress();

      const metaplex = Metaplex.make(this.connection).use(keypairIdentity(privateWallet));

      const response = await metaplex.nfts().create({
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        sellerFeeBasisPoints: 0,
        creators: [{ address: new PublicKey(privateWallet.publicKey), share: 100 }],
        collection: new PublicKey(collectionAddress),
        isMutable: false,
      });

      console.log('NFT successfully created: ', JSON.stringify(response, null, 2));

      return response.nft;
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
      throw new Error('Error minting NFT.');
    }
  }

  async sendNFT(userAddress: string, nft: Nft): Promise<void> {
    try {
      const privateWallet = this.getPrivateWallet();
      const userPublicKey = new PublicKey(userAddress);

      const metaplex = Metaplex.make(this.connection).use(keypairIdentity(privateWallet));

      const { response } = await metaplex.nfts().transfer({ nftOrSft: nft, toOwner: userPublicKey });

      console.log('NFT successfully transferred: ', JSON.stringify(response, null, 2));
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
      throw new Error('Error sending NFT.');
    }
  }

  private getPrivateWallet(): Keypair {
    const privateKeyHex = process.env.PRIVATE_KEY_HEX as string;
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));
    const privateWallet = Keypair.fromSecretKey(privateKey);
    return privateWallet;
  }

  private getCollectionAddress(): string {
    const collectionAddress = process.env.COLLECTION_ADDRESS as string;
    return collectionAddress;
  }
}
