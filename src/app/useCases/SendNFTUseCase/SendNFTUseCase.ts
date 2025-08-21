import { v4 as uuid } from "uuid";
import { NFT, PaymentEntity } from "@domain/entities/PaymentEntity";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { ISendNFTUseCase, SendNFTInput } from "./interface";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";
import { EventEntity } from "@domain/entities/EventEntity";

export class SendNFTUseCase implements ISendNFTUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketRepository: ITicketRepository,
    private EventRepository: IEventRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService,
    private Logger: ILogger
  ) {}

  async execute(input: SendNFTInput) {
    const payment = await this.validatePayment(input);
    const event = await this.validateEvent(payment.eventId);
    const dbNFT = this.findNFT(payment, input.nftId);

    const now = new Date().getTime();

    const ticketNumber = this.generateTicketId(dbNFT.collectionSymbol, event.edition);
    const metadataUrl = await this.uploadMetadata(dbNFT, payment, ticketNumber, now);

    const nftMetadata = this.generateNFTMetadata(dbNFT, ticketNumber, metadataUrl);
    const mintedToken = await this.SolanaService.mintNFT(payment.walletPublicKey, nftMetadata, "");

    await this.updatePayment(payment, dbNFT, metadataUrl, mintedToken, now, ticketNumber);

    return true;
  }

  private async validatePayment(input: SendNFTInput): Promise<PaymentEntity> {
    const payment = await this.PaymentRepository.getPaymentById(input.id);
    if (!payment) {
      this.Logger.error("[SendNFTUseCase] No se encontró el pago: ", JSON.stringify({ input }, null, 2));
      throw new Error("No se encontró el pago");
    }

    if (payment.paymentStatus !== "Approved") {
      this.Logger.error("[SendNFTUseCase] Pago no aprobado: ", JSON.stringify({ input, payment }, null, 2));
      throw new Error("Pago no aprobado");
    }

    return payment;
  }

  private async validateEvent(eventId: string): Promise<EventEntity> {
    const event = await this.EventRepository.findById(eventId);
    if (!event) {
      this.Logger.error("[SendNFTUseCase] Evento no encontrado: ", JSON.stringify({ eventId }, null, 2));
      throw new Error("El evento no existe");
    }

    return event;
  }

  private findNFT(payment: PaymentEntity, nftId: string): NFT {
    const nft = payment.nfts.find((nft) => nft.id === nftId);
    if (!nft) {
      this.Logger.error("[SendNFTUseCase] NFT no encontrado: ", JSON.stringify({ payment, nftId }, null, 2));
      throw new Error("El NFT no existe");
    }

    if (nft.mint) {
      this.Logger.error("[SendNFTUseCase] NFT ya mintado: ", JSON.stringify({ payment, nftId }, null, 2));
      throw new Error("El NFT ya tiene un mint");
    }

    return nft;
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

  private async updatePayment(payment: PaymentEntity, dbNFT: NFT, metadataUrl: string, mintedToken: any, now: number, ticketNumber: string): Promise<void> {
    const newArr = [...payment.nfts];
    const index = newArr.findIndex((nft) => nft.id === dbNFT.id);

    if (index === -1) {
      this.Logger.error("[SendNFTUseCase] NFT no encontrado: ", JSON.stringify({ payment, dbNFT }, null, 2));
      throw new Error("El NFT no existe");
    }

    newArr[index] = {
      ...newArr[index],
      metadataUrl: metadataUrl,
      mint: mintedToken.address,
      mintDate: now,
      ticketNumber: ticketNumber,
      transactionId: payment.paymentDetails?.id ?? "",
    };

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

      createdAt: nft.mintDate,
      used: 0,
      useDate: 0,

      entryCode: "",
      entryCodeExpiresAt: 0,
    };

    await this.TicketRepository.save(ticketEntity);
  }
}
