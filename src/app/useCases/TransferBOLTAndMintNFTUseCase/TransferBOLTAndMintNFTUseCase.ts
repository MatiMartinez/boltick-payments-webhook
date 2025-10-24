import { ITransferBOLTAndMintNFTUseCase, ITransferBOLTAndMintNFTUseCaseInput } from "./interface";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";

import { EventEntity } from "@domain/entities/EventEntity";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { PublicKey } from "@solana/web3.js";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { v4 as uuid } from "uuid";

export class TransferBOLTAndMintNFTUseCase implements ITransferBOLTAndMintNFTUseCase {
  constructor(
    private TicketRepository: ITicketRepository,
    private EventRepository: IEventRepository,
    private S3Service: S3Service,
    private SolanaService: SolanaService,
    private Logger: ILogger
  ) {}

  async execute(input: ITransferBOLTAndMintNFTUseCaseInput): Promise<boolean> {
    const event = await this.validateEvent(input.eventId);
    const ticketType = this.findTicketType(event, input.ticketTypeId);

    const now = new Date().getTime();

    const ticketNumber = this.generateTicketId(event.collectionSymbol, event.edition);
    const metadataUrl = await this.uploadMetadata(ticketType, event, input, ticketNumber, now);
    const nftMetadata = this.generateNFTMetadata(event, ticketType, ticketNumber, metadataUrl);

    const transferSignature = await this.transferBOLTTokens(input.walletAddress, ticketType.price);
    this.Logger.info("[TransferBOLTAndMintNFTUseCase] BOLT tokens transferidos", {
      signature: transferSignature,
      amount: ticketType.price,
    });

    const mintedToken = await this.SolanaService.mintNFT(input.walletAddress, nftMetadata, "");

    await this.saveTicket(
      event,
      ticketType,
      input,
      ticketNumber,
      metadataUrl,
      mintedToken.address,
      transferSignature,
      now
    );

    return true;
  }

  private async validateEvent(eventId: string): Promise<EventEntity> {
    const event = await this.EventRepository.findById(eventId);
    if (!event) {
      this.Logger.error(
        "[TransferBOLTAndMintNFTUseCase] Evento no encontrado: ",
        JSON.stringify({ eventId }, null, 2)
      );
      throw new Error("El evento no existe");
    }

    return event;
  }

  private findTicketType(event: EventEntity, ticketTypeId: string) {
    const ticket = event.tickets.find((t) => t.id === ticketTypeId);
    if (!ticket) {
      this.Logger.error(
        "[TransferBOLTAndMintNFTUseCase] Tipo de ticket no encontrado: ",
        JSON.stringify({ event, ticketTypeId }, null, 2)
      );
      throw new Error("El tipo de ticket no existe");
    }

    if (ticket.availableTickets <= 0) {
      this.Logger.error(
        "[TransferBOLTAndMintNFTUseCase] No hay tickets disponibles: ",
        JSON.stringify({ event, ticketTypeId }, null, 2)
      );
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

  private async uploadMetadata(
    ticketType: any,
    event: EventEntity,
    input: ITransferBOLTAndMintNFTUseCaseInput,
    ticketNumber: string,
    now: number
  ): Promise<string> {
    const bucket = "boltick-nft-metadata";
    const fileName = process.env.ENV === "PROD" ? `nfts/${uuid()}.json` : `nfts-qa/${uuid()}.json`;

    const fullMetadata = {
      transaction: {
        eventId: event.id,
        eventName: event.name,
        userId: input.userId,
        walletPublicKey: input.walletAddress,
      },

      nft: {
        id: ticketType.id,
        collectionName: event.collectionName,
        collectionSymbol: event.collectionSymbol,
        description: `Ticket digital para ${event.name}. Número: ${ticketNumber}. Tipo: ${ticketType.name}.`,
        imageUrl: ticketType.imageUrl,
        name: event.collectionName,
        symbol: event.collectionSymbol,
        ticketNumber: ticketNumber,
        type: ticketType.name,
        unitPrice: ticketType.price,
      },

      createdAt: now,
      used: 0,
      useDate: 0,
    };

    await this.S3Service.uploadFile(bucket, fileName, fullMetadata);

    return `https://${bucket}.s3.amazonaws.com/${fileName}`;
  }

  private generateNFTMetadata(
    event: EventEntity,
    ticketType: any,
    ticketNumber: string,
    metadataUrl: string
  ) {
    return {
      name: event.collectionName,
      symbol: event.collectionSymbol,
      description: `Ticket digital para ${event.name}. Número: ${ticketNumber}. Tipo: ${ticketType.name}.`,
      imageUrl: ticketType.imageUrl,
      externalUrl: metadataUrl,
    };
  }

  private async transferBOLTTokens(
    fromWalletAddress: string,
    ticketPrice: number
  ): Promise<string> {
    const creatorKeypair = this.SolanaService.getCreatorKeypair();
    const tokenMintAddress = new PublicKey(process.env.BOLT_MINT_ADDRESS as string);

    const creatorAta = getAssociatedTokenAddressSync(
      tokenMintAddress,
      creatorKeypair.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const toAddress = creatorAta.toString();

    this.Logger.info("[TransferBOLTAndMintNFTUseCase] Transfiriendo BOLT tokens", {
      fromAddress: fromWalletAddress,
      toAddress,
      amount: ticketPrice,
    });

    const signature = await this.SolanaService.transferBOLT(
      fromWalletAddress,
      toAddress,
      ticketPrice
    );

    return signature;
  }

  private async saveTicket(
    event: EventEntity,
    ticketType: any,
    input: ITransferBOLTAndMintNFTUseCaseInput,
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

      walletAddress: input.walletAddress,
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
