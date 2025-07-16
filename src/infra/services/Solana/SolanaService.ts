import { ISolanaService, NFT, Token } from "./interface";

export class SolanaService implements ISolanaService {
  private apiKey: string;
  private rpcUrl: string;
  private creatorAddress: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    this.creatorAddress = process.env.CREATOR_PUBLIC_KEY as string;
    if (!this.creatorAddress) {
      throw new Error("CREATOR_PUBLIC_KEY environment variable is required");
    }
  }

  async mintNFT(
    userAddress: string,
    nft: NFT,
    _collectionName: string
  ): Promise<Token> {
    try {
      console.log(`Minting cNFT: ${nft.name} to ${userAddress}`);

      if (!this.isValidSolanaAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      const mintParams = {
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        imageUrl: nft.image,
        externalUrl: nft.external_url,
        owner: userAddress,
        delegate: userAddress,
        collection: "",
        sellerFeeBasisPoints: 0,
        creators: [
          {
            address: this.creatorAddress,
            share: 100,
          },
        ],
        confirmTransaction: true,
      };

      console.log("Calling Helius with params:", mintParams);

      const response = await this.callHeliusRPC(
        "mintCompressedNft",
        mintParams
      );

      if (response.error) {
        throw new Error(`Helius RPC Error: ${response.error.message}`);
      }

      const result = response.result;

      if (!result.minted || !result.assetId) {
        throw new Error(
          `Mint failed. Minted: ${result.minted}, AssetId: ${result.assetId}, Signature: ${result.signature}`
        );
      }

      console.log("cNFT minted successfully!");
      console.log(`Asset ID: ${result.assetId}`);
      console.log(`Signature: ${result.signature}`);

      return {
        address: result.assetId,
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        image: nft.image,
        external_url: nft.external_url,
      };
    } catch (error) {
      const err = error as Error;
      console.error(`Error minting cNFT: ${err.message}`);
      throw new Error(`Error minting cNFT: ${err.message}`);
    }
  }

  private async callHeliusRPC(method: string, params: any): Promise<any> {
    const payload = {
      jsonrpc: "2.0",
      id: `mint-${Date.now()}`,
      method: method,
      params: params,
    };

    console.log("Making RPC call to:", this.rpcUrl);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Response data:", data);

      return data;
    } catch (error) {
      console.error("Network error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  private isValidSolanaAddress(address: string): boolean {
    try {
      const regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      return regex.test(address);
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing Helius connection...");
      const response = await this.callHeliusRPC("getHealth", {});
      console.log("Connection test successful");
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }
}
