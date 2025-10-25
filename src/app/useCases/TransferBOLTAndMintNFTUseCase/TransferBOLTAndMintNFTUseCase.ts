import { EventEntity, Ticket } from "@domain/entities/EventEntity";
import { ITransferBOLTAndMintNFTUseCase, ITransferBOLTAndMintNFTUseCaseInput } from "./interface";

import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { ITokenTransferRepository } from "@domain/repositories/TokenTransferRepository";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { TokenTransferEntity } from "@domain/entities/TokenTransferEntity";
import { v4 as uuid } from "uuid";

export class TransferBOLTAndMintNFTUseCase implements ITransferBOLTAndMintNFTUseCase {
  constructor(
    private TicketRepository: ITicketRepository,
    private EventRepository: IEventRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService,
    private TokenTransferRepository: ITokenTransferRepository,
    private Logger: ILogger
  ) {}

  async execute(input: ITransferBOLTAndMintNFTUseCaseInput): Promise<boolean> {
    const now = new Date().getTime();

    const transfer = await this.TokenTransferRepository.getById(input.transferId);

    if (!transfer) {
      this.Logger.error("[TransferBOLTAndMintNFTUseCase] Transferencia no encontrada", {
        transferId: input.transferId,
      });
      throw new Error("La transferencia no existe");
    }
    try {
      const event = await this.validateEvent(transfer.eventId);
      const ticket = this.findTicketType(event, transfer.tokenId);

      const ticketNumber = this.generateTicketId(event.collectionSymbol, event.edition);
      const metadataUrl = await this.uploadMetadata(ticket, transfer, event, ticketNumber, now);
      const nftMetadata = this.generateNFTMetadata(event, ticket, ticketNumber, metadataUrl);

      const transferSignature = await this.transferBOLTTokens(transfer.walletAddress, ticket.price);
      this.Logger.info("[TransferBOLTAndMintNFTUseCase] BOLT tokens transferidos", {
        signature: transferSignature,
        amount: ticket.price,
      });

      const mintedToken = await this.SolanaService.mintNFT(transfer.walletAddress, nftMetadata, "");

      await this.saveTicket(event, ticket, transfer, ticketNumber, metadataUrl, mintedToken.address, transferSignature, now);

      // Actualizar estado a Completed
      await this.TokenTransferRepository.update(transfer.walletAddress, transfer.createdAt, {
        updatedAt: new Date().getTime(),
        transactionStatus: "Completed",
        transactionHash: transferSignature,
        nftAddress: mintedToken.address,
      });

      this.Logger.info("[TransferBOLTAndMintNFTUseCase] Transfer completado exitosamente", {
        transferId: transfer.transactionHash,
        assetId: mintedToken.address,
      });

      return true;
    } catch (error) {
      const err = error as Error;
      this.Logger.error("[TransferBOLTAndMintNFTUseCase] Error en la transferencia", {
        transferId: 0,
        error: err.message,
      });

      // Actualizar estado a Failed
      await this.TokenTransferRepository.update(transfer.walletAddress, transfer.createdAt, {
        updatedAt: new Date().getTime(),
        transactionStatus: "Failed",
      });

      throw error;
    }
  }

  private async validateEvent(eventId: string): Promise<EventEntity> {
    const event = await this.EventRepository.findById(eventId);
    if (!event) {
      this.Logger.error("[TransferBOLTAndMintNFTUseCase] Evento no encontrado: ", JSON.stringify({ eventId }, null, 2));
      throw new Error("El evento no existe");
    }

    return event;
  }

  private findTicketType(event: EventEntity, ticketTypeId: string) {
    const ticket = event.tickets.find((t) => t.id === ticketTypeId);
    if (!ticket) {
      this.Logger.error("[TransferBOLTAndMintNFTUseCase] Tipo de ticket no encontrado: ", JSON.stringify({ event, ticketTypeId }, null, 2));
      throw new Error("El tipo de ticket no existe");
    }

    if (ticket.availableTickets <= 0) {
      this.Logger.error("[TransferBOLTAndMintNFTUseCase] No hay tickets disponibles: ", JSON.stringify({ event, ticketTypeId }, null, 2));
      throw new Error("No hay tickets disponibles");
    }

    return ticket;
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

  private async uploadMetadata(ticket: Ticket, transfer: TokenTransferEntity, event: EventEntity, ticketNumber: string, now: number): Promise<string> {
    const bucket = "boltick-nft-metadata";
    const fileName = process.env.ENV === "PROD" ? `nfts/${uuid()}.json` : `nfts-qa/${uuid()}.json`;

    const fullMetadata = {
      transaction: {
        walletPublicKey: transfer.walletAddress,
        transactionHash: transfer.transactionHash,
      },

      nft: {
        address: transfer.nftAddress,
        collectionName: event.collectionName,
        collectionSymbol: event.collectionSymbol,
        description: `Ticket digital para ${event.name}. Número: ${ticketNumber}. Tipo: ${ticket.name}.`,
        imageUrl: ticket.imageUrl,
        name: event.collectionName,
        symbol: event.collectionSymbol,
        ticketNumber: ticketNumber,
        type: ticket.name,
        unitPrice: ticket.price,
      },

      createdAt: now,
      used: 0,
      useDate: 0,
    };

    await this.S3Service.uploadFile(bucket, fileName, fullMetadata);

    return `https://${bucket}.s3.amazonaws.com/${fileName}`;
  }

  private generateNFTMetadata(event: EventEntity, ticketType: any, ticketNumber: string, metadataUrl: string) {
    return {
      name: event.collectionName,
      symbol: event.collectionSymbol,
      description: `Ticket digital para ${event.name}. Número: ${ticketNumber}. Tipo: ${ticketType.name}.`,
      imageUrl: ticketType.imageUrl,
      externalUrl: metadataUrl,
    };
  }

  private async transferBOLTTokens(fromWalletAddress: string, ticketPrice: number): Promise<string> {
    const creatorKeypair = this.SolanaService.getCreatorKeypair();

    this.Logger.info("[TransferBOLTAndMintNFTUseCase] Transfiriendo BOLT tokens", {
      fromAddress: fromWalletAddress,
      toAddress: creatorKeypair.publicKey,
      amount: ticketPrice,
    });

    const signature = await this.SolanaService.transferBOLT(fromWalletAddress, creatorKeypair.publicKey.toString(), ticketPrice);

    return signature;
  }

  private async saveTicket(
    event: EventEntity,
    ticketType: any,
    transfer: TokenTransferEntity,
    ticketNumber: string,
    metadataUrl: string,
    assetId: string,
    transferSignature: string,
    now: number
  ): Promise<void> {
    const ticketEntity: TicketEntity = {
      ticketNumber: ticketNumber,
      type: ticketType.name,
      unitPrice: ticketType.price,
      imageUrl: ticketType.imageUrl,
      metadataUrl: metadataUrl,

      eventId: event.id,
      eventName: event.name,
      prName: "",

      walletAddress: transfer.walletAddress,
      assetId: assetId,
      collectionName: event.collectionName,
      collectionSymbol: event.collectionSymbol,

      createdAt: now,
      used: 0,
      useDate: 0,

      entryCode: "",
      entryCodeExpiresAt: 0,
    };

    await this.TicketRepository.save(ticketEntity);

    this.Logger.info("[TransferBOLTAndMintNFTUseCase] Ticket guardado exitosamente", {
      ticketNumber,
      assetId,
      transferSignature,
    });
  }
}
