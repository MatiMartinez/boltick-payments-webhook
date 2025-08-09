import { IValidateManualEntryUseCase, IValidateManualEntryUseCaseInput, IValidateManualEntryUseCaseOutput } from "./interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IS3Service } from "@services/S3/interface";

export class ValidateManualEntryUseCase implements IValidateManualEntryUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private s3Service: IS3Service
  ) {}

  public async execute(input: IValidateManualEntryUseCaseInput): Promise<IValidateManualEntryUseCaseOutput> {
    if (!input.ticketNumber || input.ticketNumber.trim() === "") {
      return { result: 0, message: "Número de ticket no proporcionado" };
    }

    const ticket = await this.ticketRepository.findByTicketNumber(input.ticketNumber.trim());

    if (!ticket) {
      return { result: 0, message: "Ticket no encontrado" };
    }

    if (ticket.used === 1) {
      return { result: 0, message: "Ticket ya utilizado" };
    }

    if (!ticket.entryCode || ticket.entryCodeExpiresAt < Date.now()) {
      return { result: 0, message: "Código de entrada inválido o expirado" };
    }

    const now = Date.now();

    const updatedTicket = {
      ...ticket,
      used: 1,
      useDate: now,
      entryCode: "",
      entryCodeExpiresAt: 0,
    };

    await this.ticketRepository.update(updatedTicket);
    await this.updateS3Metadata(ticket.metadataUrl, now);

    console.log("Ticket validado manualmente:", updatedTicket.ticketNumber);

    return { result: 1, message: "Ingreso validado correctamente", data: { ticketNumber: updatedTicket.ticketNumber } };
  }

  private async updateS3Metadata(metadataUrl: string, useDate: number): Promise<void> {
    const { bucket, fileKey } = this.parseS3Url(metadataUrl);
    const currentMetadata = await this.s3Service.getFile(bucket, fileKey);
    const updatedMetadata = {
      ...currentMetadata,
      used: 1,
      useDate: useDate,
    };

    await this.s3Service.updateFile(bucket, fileKey, updatedMetadata);
  }

  private parseS3Url(url: string): { bucket: string; fileKey: string } {
    const urlParts = url.replace("https://", "").split("/");
    const bucketWithS3 = urlParts[0];
    const bucket = bucketWithS3.split(".")[0];
    const fileKey = urlParts.slice(1).join("/");

    return { bucket, fileKey };
  }
}
