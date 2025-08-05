import { IValidateEntryUseCase, IValidateEntryUseCaseInput, IValidateEntryUseCaseOutput } from "./interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IJWTService } from "@services/JWT/interface";

export class ValidateEntryUseCase implements IValidateEntryUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private jwtService: IJWTService
  ) {}

  public async execute(input: IValidateEntryUseCaseInput): Promise<IValidateEntryUseCaseOutput> {
    try {
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

      const updatedTicket = {
        ...ticket,
        used: 1,
        useDate: Date.now(),
      };

      await this.ticketRepository.update(updatedTicket);

      return { result: 1, message: "Ingreso validado correctamente" };
    } catch (error) {
      return { result: 0, message: "Error al validar el ingreso" };
    }
  }
}
