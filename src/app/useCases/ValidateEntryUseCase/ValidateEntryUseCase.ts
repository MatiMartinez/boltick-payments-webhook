import { IValidateEntryUseCase, IValidateEntryUseCaseInput, IValidateEntryUseCaseOutput } from "./interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IJWTService } from "@services/JWT/interface";
import { IS3Service } from "@services/S3/interface";

export class ValidateEntryUseCase implements IValidateEntryUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private jwtService: IJWTService,
    private s3Service: IS3Service
  ) {}

  public async execute(input: IValidateEntryUseCaseInput): Promise<IValidateEntryUseCaseOutput> {
    if (input.token === "") {
      return { result: 0, message: "Token no proporcionado" };
    }

    const decoded = this.jwtService.verifyToken(input.token);

    if (!decoded || !decoded.ticketNumber) {
      return { result: 0, message: "Token inválido o expirado" };
    }

    const ticket = await this.ticketRepository.findByTicketNumber(decoded.ticketNumber);

    if (!ticket) {
      return { result: 0, message: "Ticket no encontrado" };
    }

    if (ticket.used === 1) {
      return { result: 0, message: "Ticket ya utilizado" };
    }

    const now = Date.now();

    const updatedTicket = {
      ...ticket,
      used: 1,
      useDate: now,
    };

    await this.ticketRepository.update(updatedTicket);
    await this.updateS3Metadata(ticket.metadataUrl, now);

    console.log("Ticket validado:", updatedTicket.ticketNumber);

    return { result: 1, message: "Ingreso validado correctamente" };
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
