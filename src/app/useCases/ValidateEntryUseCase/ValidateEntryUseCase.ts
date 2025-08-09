import { IValidateEntryUseCase, IValidateEntryUseCaseInput, IValidateEntryUseCaseOutput } from "./interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IS3Service } from "@services/S3/interface";

export class ValidateEntryUseCase implements IValidateEntryUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private s3Service: IS3Service
  ) {}

  public async execute(input: IValidateEntryUseCaseInput): Promise<IValidateEntryUseCaseOutput> {
    if (input.token === "") {
      console.log("Token no proporcionado: ", JSON.stringify(input));
      return { result: 0, message: "Token no proporcionado" };
    }

    const decoded = this.decodedToken(input.token);

    if (!decoded || !decoded.ticketNumber || !decoded.entryCode || decoded.entryCodeExpiresAt < Date.now()) {
      console.log("Token inválido o expirado: ", JSON.stringify(input));

      return { result: 0, message: "Token inválido o expirado" };
    }

    const ticket = await this.ticketRepository.findByTicketNumber(decoded.ticketNumber);

    if (!ticket) {
      console.log("Ticket no encontrado: ", JSON.stringify(input));
      return { result: 0, message: "Ticket no encontrado" };
    }

    if (ticket.used === 1) {
      console.log("Ticket ya utilizado: ", JSON.stringify(input));
      return { result: 0, message: "Ticket ya utilizado" };
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

    console.log("Ticket validado:", updatedTicket.ticketNumber);

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

  private decodedToken(value: string): { ticketNumber: string; entryCode: string; entryCodeExpiresAt: number } {
    const [ticketNumber, entryCode, entryCodeExpiresAt] = value.split(":");
    return { ticketNumber, entryCode, entryCodeExpiresAt: Number(entryCodeExpiresAt) };
  }
}
