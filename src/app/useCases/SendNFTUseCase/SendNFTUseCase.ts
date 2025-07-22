import { v4 as uuid } from "uuid";

import { NFT, PaymentEntity } from "@domain/entities/PaymentEntity";
import { ISendNFTUseCase, SendNFTInput } from "./interface";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { events } from "@db/events";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";

export class SendNFTUseCase implements ISendNFTUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
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

    const index = payment.nfts.findIndex(
      (element) => element.id === input.nftId
    );
    if (index === -1) {
      throw new Error("The NFT does not exist.");
    }

    const currentNft = payment.nfts[index];
    if (currentNft.mint) {
      throw new Error("The NFT has already been minted.");
    }

    const ticketNumber = this.generateTicketId(
      currentNft.collectionSymbol,
      currentEvent.edition
    );

    const metadataUrl = await this.uploadMetadata(
      currentNft,
      payment,
      ticketNumber
    );

    const nftMetadata = this.generateNFTMetadata(
      currentNft,
      ticketNumber,
      metadataUrl
    );

    const mintedToken = await this.SolanaService.mintNFT(
      payment.walletPublicKey,
      nftMetadata,
      "HtpBxJRw7cXBUwkgvYNLLZsWGuoxAR98f3CcrYiX8iCP"
    );

    const newArr = [...payment.nfts];
    newArr[index] = {
      ...newArr[index],
      metadataUrl: metadataUrl,
      mint: mintedToken.address,
      mintDate: new Date().getTime(),
      ticketNumber: ticketNumber,
      transactionId: payment.paymentDetails?.id ?? "",
    };

    await this.PaymentRepository.updateNFT(payment.userId, payment.createdAt, {
      nfts: newArr,
      updatedAt: new Date().getTime(),
    });

    return true;
  }

  private generateNFTMetadata(
    nft: NFT,
    ticketNumber: string,
    metadataUrl: string
  ) {
    const image = this.chooseImage(nft.type);

    return {
      name: `${nft.collectionName}`,
      symbol: nft.collectionSymbol,
      description: `Ticket digital para ${nft.collectionName}. Número: ${ticketNumber}. Tipo: ${nft.type}.`,
      image: image,
      external_url: metadataUrl,
    };
  }

  private async uploadMetadata(
    nft: NFT,
    payment: PaymentEntity,
    ticketNumber: string
  ): Promise<string> {
    const bucket = "boltick-nft-metadata";
    const fileName = `nfts/${uuid()}.json`;

    const image = this.chooseImage(nft.type);

    // Metadata completa para S3 (backup/referencia)
    const fullMetadata = {
      // Información del NFT
      name: `${nft.collectionName} - ${ticketNumber}`,
      symbol: nft.collectionSymbol,
      description: `Ticket digital para ${nft.collectionName}. Número: ${ticketNumber}. Tipo: ${nft.type}.`,
      image: image,

      // Información del pago
      payment: {
        id: payment.id,
        userId: payment.userId,
        eventId: payment.eventId,
      },

      // Información del NFT/ticket
      nft: {
        id: nft.id,
        collectionName: nft.collectionName,
        collectionSymbol: nft.collectionSymbol,
        ticketNumber: ticketNumber,
        type: nft.type,
        unitPrice: nft.unitPrice,
      },

      // Metadatos adicionales
      createdAt: new Date().getTime(),
      used: 0,
      useDate: 0,
    };

    await this.S3Service.uploadFile(bucket, fileName, fullMetadata);

    // Retornar URL pública para external_url
    return `https://${bucket}.s3.amazonaws.com/${fileName}`;
  }

  private chooseImage(type: string): string {
    const images: Record<string, string> = {
      General: "https://d1p1oqc35oee7y.cloudfront.net/paax/general.png",
      VIP: "https://d1p1oqc35oee7y.cloudfront.net/paax/vip.png",
    };

    return images[type] || "";
  }

  private generateTicketId(companyPrefix: string, eventNumber: number): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetter1 = letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
    const randomLetter2 = letters.charAt(
      Math.floor(Math.random() * letters.length)
    );

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    const prefix = companyPrefix.substring(0, 3).toUpperCase();
    const eventCode = eventNumber.toString().padStart(2, "0");

    return `${prefix}${eventCode}-${randomLetter1}${randomLetter2}${randomDigits}`;
  }
}
