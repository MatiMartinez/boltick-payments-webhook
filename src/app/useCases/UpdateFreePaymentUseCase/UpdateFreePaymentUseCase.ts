import { NFT, Status } from "@domain/entities/PaymentEntity";
import { IUpdateFreePaymentUseCase, IUpdateFreePaymentUseCaseInput } from "./interface";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { ILogger } from "@commons/Logger/interface";
import { ISQSService } from "@services/SQS/interface";

export class UpdateFreePaymentUseCase implements IUpdateFreePaymentUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketCountRepository: ITicketCountRepository,
    private SQSService: ISQSService,
    private Logger: ILogger
  ) {}

  async execute(input: IUpdateFreePaymentUseCaseInput) {
    const payment = await this.PaymentRepository.getPaymentById(input.id);

    if (!payment) {
      this.Logger.error("[UpdateFreePaymentUseCase] Pago no encontrado: ", JSON.stringify({ input, payment }, null, 2));
      return { success: false, message: "Pago no encontrado" };
    }

    if (payment.paymentStatus !== "Pending") {
      this.Logger.error("[UpdateFreePaymentUseCase] Pago en estado distinto a pendiente: ", JSON.stringify({ input, payment }, null, 2));
      return { success: false, message: "Pago en estado distinto a pendiente" };
    }

    const now = new Date().getTime();

    const updatedPayment = await this.PaymentRepository.updatePayment(payment.userId, payment.createdAt, {
      paymentStatus: "Approved" as Status,
      updatedAt: now,
      paymentDetails: {
        amount: 0,
        code: "1111",
        id: "1111",
        updatedAt: now,
      },
    });

    await this.updateTicketCount(updatedPayment.eventId, updatedPayment.nfts);

    await Promise.all(
      updatedPayment.nfts.map((nft) => this.SQSService.sendMessage(updatedPayment.id, { action: "SEND_NFT", body: { id: updatedPayment.id, nftId: nft.id } }))
    );

    return { success: true, message: "Pago actualizado correctamente" };
  }

  private async updateTicketCount(eventId: string, nfts: NFT[]) {
    const ticketCount = await this.TicketCountRepository.getTicketCount(eventId);

    // Crear un mapa de la cantidad de NFTs por tipo
    const nftCountByType = new Map<string, number>();
    nfts.forEach((nft) => {
      const currentCount = nftCountByType.get(nft.type) || 0;
      nftCountByType.set(nft.type, currentCount + 1);
    });

    // Actualizar el contador sumando la cantidad real de NFTs comprados por tipo
    const newCount = ticketCount.count.map((count) => {
      const nftCount = nftCountByType.get(count.type) || 0;
      return {
        type: count.type,
        count: count.count + nftCount,
        used: count.used,
      };
    });

    await this.TicketCountRepository.updateTicketCount(eventId, newCount);
  }
}
