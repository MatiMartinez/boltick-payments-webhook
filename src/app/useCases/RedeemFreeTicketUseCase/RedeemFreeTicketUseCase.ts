import { IRedeemFreeTicketUseCase, RedeemFreeTicketInput, RedeemFreeTicketOutput } from "./interface";

import { EventEntity, Ticket } from "@domain/entities/EventEntity";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { ITicketService } from "@app/services/TicketService/interface";
import { v4 as uuid } from "uuid";

export class RedeemFreeTicketUseCase implements IRedeemFreeTicketUseCase {
  constructor(
    private EventRepository: IEventRepository,
    private TicketRepository: ITicketRepository,
    private TicketCountRepository: ITicketCountRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService,
    private TicketService: ITicketService,
    private Logger: ILogger
  ) {}

  async execute(input: RedeemFreeTicketInput): Promise<RedeemFreeTicketOutput> {
    try {
      input.walletPublicKey = input.walletPublicKey.replace(/\s/g, "").trim();

      this.validateSolanaWallet(input.walletPublicKey);

      const event = await this.validateEvent(input.eventId);
      const ticketInfo = this.findTicketType(event, input.ticketType);

      this.validateFreeTicket(ticketInfo);

      const now = new Date().getTime();

      const ticketNumber = this.TicketService.generateId(event.collectionSymbol, event.edition);
      const metadataUrl = await this.uploadMetadata(event, ticketInfo, input, ticketNumber, now);
      const nftMetadata = this.generateNFTMetadata(event, ticketInfo, ticketNumber, metadataUrl);
      const mintedToken = await this.SolanaService.mintNFT(input.walletPublicKey, nftMetadata, "");

      await this.saveTicket(event, ticketInfo, input, mintedToken.address, ticketNumber, metadataUrl, now);

      await this.updateTicketCount(input.eventId, `Free ${ticketInfo.name}`);

      return {
        success: 1,
        data: {
          ticketNumber,
          type: input.ticketType,
        },
        message: "Ticket free canjeado exitosamente",
      };
    } catch (error) {
      const err = error as Error;
      this.Logger.error("[RedeemFreeTicketUseCase] Error al canjear ticket free:", {
        error: err.message,
        input,
      });
      return {
        success: 0,
        message: err.message || "Error al canjear ticket free",
      };
    }
  }

  private validateSolanaWallet(walletAddress: string): void {
    if (!walletAddress || walletAddress.trim() === "") {
      throw new Error("La dirección de wallet es requerida");
    }

    if (walletAddress.length < 32 || walletAddress.length > 44) {
      throw new Error("La dirección de wallet no tiene un formato válido de Solana");
    }

    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(walletAddress)) {
      throw new Error("La dirección de wallet contiene caracteres inválidos. Debe ser una dirección válida de Solana");
    }
  }

  private async validateEvent(eventId: string): Promise<EventEntity> {
    const event = await this.EventRepository.findById(eventId);
    if (!event) {
      throw new Error("El evento no existe");
    }
    return event;
  }

  private findTicketType(event: EventEntity, ticketType: string): Ticket {
    const ticket = event.tickets.find((t) => t.name === ticketType || t.id === ticketType);
    if (!ticket) {
      throw new Error(`El tipo de ticket "${ticketType}" no existe para este evento`);
    }
    return ticket;
  }

  private validateFreeTicket(ticketInfo: any): void {
    if (ticketInfo.price !== 0 || ticketInfo.priceWithoutTax !== 0) {
      throw new Error("Este tipo de ticket no es gratuito");
    }
  }

  private async uploadMetadata(event: EventEntity, ticketInfo: Ticket, input: RedeemFreeTicketInput, ticketNumber: string, now: number): Promise<string> {
    const bucket = "boltick-nft-metadata";
    const fileName = process.env.ENV === "PROD" ? `nfts/${uuid()}.json` : `nfts-qa/${uuid()}.json`;

    const fullMetadata = {
      payment: {
        id: "FREE",
        eventId: event.id,
        eventName: event.name,
        prName: "",
        userId: "",
        walletPublicKey: input.walletPublicKey,
      },

      nft: {
        id: "FREE",
        collectionName: event.collectionName,
        collectionSymbol: event.collectionSymbol,
        description: `Ticket digital gratuito para ${event.name}. Número: ${ticketNumber}. Tipo: ${ticketInfo.name}.`,
        imageUrl: ticketInfo.imageUrl,
        name: event.collectionName,
        symbol: event.collectionSymbol,
        ticketNumber: ticketNumber,
        type: ticketInfo.name,
        unitPrice: 0,
      },

      createdAt: now,
      used: 0,
      useDate: 0,
    };

    await this.S3Service.uploadFile(bucket, fileName, fullMetadata);

    return `https://${bucket}.s3.amazonaws.com/${fileName}`;
  }

  private generateNFTMetadata(event: EventEntity, ticketInfo: any, ticketNumber: string, metadataUrl: string) {
    return {
      name: event.collectionName,
      symbol: event.collectionSymbol,
      description: `Ticket digital gratuito para ${event.name}. Número: ${ticketNumber}. Tipo: ${ticketInfo.name}.`,
      imageUrl: ticketInfo.imageUrl,
      externalUrl: metadataUrl,
    };
  }

  private async saveTicket(
    event: EventEntity,
    ticketInfo: Ticket,
    input: RedeemFreeTicketInput,
    mint: string,
    ticketNumber: string,
    metadataUrl: string,
    now: number
  ): Promise<void> {
    const ticketEntity: TicketEntity = {
      ticketNumber,
      type: ticketInfo.name,
      unitPrice: 0,
      imageUrl: ticketInfo.imageUrl,
      metadataUrl,

      eventId: event.id,
      eventName: event.name,
      prName: "",

      walletAddress: input.walletPublicKey,
      assetId: mint,
      collectionName: event.collectionName,
      collectionSymbol: event.collectionSymbol,

      createdAt: now,
      used: 0,
      useDate: 0,

      entryCode: "",
      entryCodeExpiresAt: 0,

      category: "FREE",
      eventIdCategoryIndex: `${event.id}#FREE`,
    };

    await this.TicketRepository.save(ticketEntity);
  }

  private async updateTicketCount(eventId: string, ticketType: string): Promise<void> {
    try {
      const ticketCount = await this.TicketCountRepository.getTicketCount(eventId);

      const newCount = ticketCount.count.map((count) => {
        if (count.type === ticketType) {
          return {
            type: count.type,
            count: count.count + 1,
            used: count.used,
          };
        }
        return count;
      });

      await this.TicketCountRepository.updateTicketCount(eventId, newCount);
    } catch (error) {
      this.Logger.error("[RedeemFreeTicketUseCase] Error al actualizar contador de tickets:", {
        error: (error as Error).message,
        eventId,
        ticketType,
      });
    }
  }
}
