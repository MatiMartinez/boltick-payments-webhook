import { v4 as uuid } from "uuid";
import { NFT, PaymentEntity } from "@domain/entities/PaymentEntity";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { ISendNFTUseCase, SendNFTInput } from "./interface";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { events } from "@db/events";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketRepository } from "@domain/repositories/TicketRepository";

export class SendNFTUseCase implements ISendNFTUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketRepository: ITicketRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService
  ) {}

  async execute(input: SendNFTInput) {
    const payment = await this.PaymentRepository.getPaymentById(input.id);
    if (payment.paymentStatus !== "Approved") {
      throw new Error("Payment is not approved.");
    }

    const currentEvent = events.find((el) => el.id === payment.eventId);
    if (!currentEvent) {
      throw new Error("The NFT event does not exist.");
    }

    const index = payment.nfts.findIndex((element) => element.id === input.nftId);
    if (index === -1) {
      throw new Error("The NFT does not exist.");
    }

    const currentNft = payment.nfts[index];
    if (currentNft.mint) {
      throw new Error("The NFT has already been minted.");
    }

    const now = new Date().getTime();

    const ticketNumber = this.generateTicketId(currentNft.collectionSymbol, currentEvent.edition);
    const metadataUrl = await this.uploadMetadata(currentNft, payment, ticketNumber, now);

    const nftMetadata = this.generateNFTMetadata(currentNft, ticketNumber, metadataUrl);
    const mintedToken = await this.SolanaService.mintNFT(payment.walletPublicKey, nftMetadata, "");

    await this.updatePayment(payment, index, metadataUrl, mintedToken, now, ticketNumber);

    return true;
  }

  private generateTicketId(companyPrefix: string, eventNumber: number): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomLetter2 = letters.charAt(Math.floor(Math.random() * letters.length));

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    const prefix = companyPrefix.substring(0, 3).toUpperCase();
    const eventCode = eventNumber.toString().padStart(2, "0");

    return `${prefix}${eventCode}-${randomLetter1}${randomLetter2}${randomDigits}`;
  }

  private async uploadMetadata(nft: NFT, payment: PaymentEntity, ticketNumber: string, now: number): Promise<string> {
    const bucket = "boltick-nft-metadata";
    const fileName = process.env.ENV === "PROD" ? `nfts/${uuid()}.json` : `nfts-qa/${uuid()}.json`;

    const fullMetadata = {
      payment: {
        id: payment.id,
        eventId: payment.eventId,
        eventName: payment.eventName,
        prName: payment.prName,
        userId: payment.userId,
        walletPublicKey: payment.walletPublicKey,
      },

      nft: {
        id: nft.id,
        collectionName: nft.collectionName,
        collectionSymbol: nft.collectionSymbol,
        description: `Ticket digital para ${nft.collectionName}. Número: ${ticketNumber}. Tipo: ${nft.type}.`,
        imageUrl: nft.imageUrl,
        name: nft.collectionName,
        symbol: nft.collectionSymbol,
        ticketNumber: ticketNumber,
        type: nft.type,
        unitPrice: nft.unitPrice,
      },

      createdAt: now,
      used: 0,
      useDate: 0,
    };

    await this.S3Service.uploadFile(bucket, fileName, fullMetadata);

    return `https://${bucket}.s3.amazonaws.com/${fileName}`;
  }

  private generateNFTMetadata(nft: NFT, ticketNumber: string, metadataUrl: string) {
    return {
      name: nft.collectionName,
      symbol: nft.collectionSymbol,
      description: `Ticket digital para ${nft.collectionName}. Número: ${ticketNumber}. Tipo: ${nft.type}.`,
      imageUrl: nft.imageUrl,
      externalUrl: metadataUrl,
    };
  }

  private async updatePayment(
    payment: PaymentEntity,
    index: number,
    metadataUrl: string,
    mintedToken: any,
    now: number,
    ticketNumber: string
  ): Promise<void> {
    const newArr = [...payment.nfts];
    newArr[index] = {
      ...newArr[index],
      metadataUrl: metadataUrl,
      mint: mintedToken.address,
      mintDate: now,
      ticketNumber: ticketNumber,
      transactionId: payment.paymentDetails?.id ?? "",
    };

    console.log("NFT to save: ", JSON.stringify(newArr[index], null, 2));

    await this.PaymentRepository.updateNFT(payment.userId, payment.createdAt, { nfts: newArr, updatedAt: now });
    await this.saveTicket(payment, newArr[index]);
  }

  private async saveTicket(payment: PaymentEntity, nft: NFT): Promise<void> {
    const ticketEntity: TicketEntity = {
      ticketNumber: nft.ticketNumber,
      type: nft.type,
      unitPrice: nft.unitPrice,
      imageUrl: nft.imageUrl,
      metadataUrl: nft.metadataUrl,

      eventId: payment.eventId,
      eventName: payment.eventName,
      prName: payment.prName,

      walletAddress: payment.walletPublicKey,
      assetId: nft.mint,
      collectionName: nft.collectionName,
      collectionSymbol: nft.collectionSymbol,

      createdAt: new Date().getTime(),
      used: 0,
      useDate: 0,

      entryCode: "",
      entryCodeExpiresAt: 0,
    };

    await this.TicketRepository.save(ticketEntity);
  }
}
