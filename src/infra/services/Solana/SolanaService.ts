import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { ISolanaService, NFT, Token } from "./interface";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export class SolanaService implements ISolanaService {
  private apiKey: string;
  private rpcUrl: string;
  private creatorAddress: string;
  private rpcBoltUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
    this.rpcBoltUrl = process.env.RPC_BOLT_URL as string;

    this.creatorAddress = process.env.CREATOR_PUBLIC_KEY as string;
    if (!this.creatorAddress) {
      throw new Error("CREATOR_PUBLIC_KEY environment variable is required");
    }
  }

  async mintNFT(userAddress: string, nft: NFT, _collectionName: string): Promise<Token> {
    try {
      console.log(`Minting cNFT: ${nft.name} to ${userAddress}`);

      if (!this.isValidSolanaAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      const mintParams = {
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        imageUrl: nft.imageUrl,
        externalUrl: nft.externalUrl,
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

      const response = await this.callHeliusRPC("mintCompressedNft", mintParams);

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
        imageUrl: nft.imageUrl,
        externalUrl: nft.externalUrl,
      };
    } catch (error) {
      const err = error as Error;
      console.error(`Error minting cNFT: ${err.message}`);
      throw new Error(`Error minting cNFT: ${err.message}`);
    }
  }

  async mintBOLT(toAddress: string, amount: number) {
    try {
      console.log(`Minting ${amount} BOLT tokens to ${toAddress}`);

      if (!this.isValidSolanaAddress(toAddress)) {
        throw new Error("Invalid recipient address");
      }

      const mintAuthorityKeypair = process.env.CREATOR_KEYPAIR;
      if (!mintAuthorityKeypair) {
        throw new Error("CREATOR_KEYPAIR environment variable is required");
      }

      const connection = new Connection(this.rpcBoltUrl, "confirmed");

      const mintAuthority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(mintAuthorityKeypair)));

      console.log("mintAuthority", mintAuthority.publicKey);

      const toPublicKey = new PublicKey(toAddress);
      const tokenMintAddress = new PublicKey(process.env.BOLT_MINT_ADDRESS as string);

      const toTokenAccountAddress = getAssociatedTokenAddressSync(
        tokenMintAddress,
        toPublicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      console.log(`To token account address: ${toTokenAccountAddress.toString()}`);

      let accountExists = false;
      try {
        await getAccount(connection, toTokenAccountAddress, undefined, TOKEN_2022_PROGRAM_ID);
        accountExists = true;
        console.log("Associated token account already exists");
      } catch (error) {
        console.log("Associated token account does not exist, will create in transaction");
      }

      const transaction = new Transaction();

      if (!accountExists) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            mintAuthority.publicKey,
            toTokenAccountAddress,
            toPublicKey,
            tokenMintAddress,
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      const mintAmount = this.calculateMintAmount(amount);

      transaction.add(
        createMintToInstruction(
          tokenMintAddress,
          toTokenAccountAddress,
          mintAuthority.publicKey,
          mintAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [mintAuthority]);

      console.log(`BOLT tokens minted successfully! Signature: ${signature}`);
      return signature;
    } catch (error) {
      const err = error as Error;
      console.error(`Error minting BOLT token: ${err.message}`);
      throw new Error(`Error minting BOLT token: ${err.message}`);
    }
  }

  async transferBOLT(fromAddress: string, toAddress: string, amount: number): Promise<string> {
    try {
      console.log(`Transferring ${amount} BOLT tokens from ${fromAddress} to ${toAddress}`);

      if (!this.isValidSolanaAddress(fromAddress) || !this.isValidSolanaAddress(toAddress)) {
        throw new Error("Invalid address provided");
      }

      const connection = new Connection(this.rpcBoltUrl, "confirmed");
      const delegate = this.getCreatorKeypair();

      const fromPublicKey = new PublicKey(fromAddress);
      const toPublicKey = new PublicKey(toAddress);
      const tokenMintAddress = new PublicKey(process.env.BOLT_MINT_ADDRESS as string);

      const fromTokenAccountAddress = getAssociatedTokenAddressSync(
        tokenMintAddress,
        fromPublicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const toTokenAccountAddress = getAssociatedTokenAddressSync(
        tokenMintAddress,
        toPublicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      console.log(`From token account: ${fromTokenAccountAddress.toString()}`);
      console.log(`To token account: ${toTokenAccountAddress.toString()}`);

      const fromAccount = await getAccount(
        connection,
        fromTokenAccountAddress,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      const transferAmount = this.calculateMintAmount(amount);

      if (fromAccount.amount < transferAmount) {
        throw new Error(
          `Insufficient balance. Has: ${fromAccount.amount}, needs: ${transferAmount}`
        );
      }

      const transaction = new Transaction();

      let toAccountExists = false;
      try {
        await getAccount(connection, toTokenAccountAddress, undefined, TOKEN_2022_PROGRAM_ID);
        toAccountExists = true;
        console.log("Destination token account already exists");
      } catch (error) {
        console.log("Destination token account does not exist, will create in transaction");
      }

      if (!toAccountExists) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            delegate.publicKey,
            toTokenAccountAddress,
            toPublicKey,
            tokenMintAddress,
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      transaction.add(
        createTransferCheckedInstruction(
          fromTokenAccountAddress,
          tokenMintAddress,
          toTokenAccountAddress,
          delegate.publicKey,
          transferAmount,
          9,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [delegate]);

      console.log(`BOLT tokens transferred successfully! Signature: ${signature}`);
      return signature;
    } catch (error) {
      const err = error as Error;
      console.error(`Error transferring BOLT token: ${err.message}`);
      throw new Error(`Error transferring BOLT token: ${err.message}`);
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
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
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

  private calculateMintAmount(amount: number): number {
    const decimals = 9;
    return amount * Math.pow(10, decimals);
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

  /**
   * Obtiene el Keypair del creador a partir de CREATOR_KEYPAIR
   * @returns El Keypair del creador
   */
  getCreatorKeypair(): Keypair {
    try {
      const creatorKeypair = process.env.CREATOR_KEYPAIR;
      if (!creatorKeypair) {
        throw new Error("CREATOR_KEYPAIR environment variable is required");
      }

      const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(creatorKeypair)));
      return keypair;
    } catch (error) {
      const err = error as Error;
      console.error(`Error getting creator keypair: ${err.message}`);
      throw new Error(`Error getting creator keypair: ${err.message}`);
    }
  }
}
