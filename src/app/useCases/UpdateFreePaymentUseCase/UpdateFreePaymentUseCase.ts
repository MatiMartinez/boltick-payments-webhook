import { NFT, Status } from "@domain/entities/PaymentEntity";
import { IUpdateFreePaymentUseCase } from "./interface";
import { EventBridgeService } from "@services/EventBridge/EventBridgeService";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { ILogger } from "@commons/Logger/interface";

export class UpdateFreePaymentUseCase implements IUpdateFreePaymentUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketCountRepository: ITicketCountRepository,
    private EventBridgeService: EventBridgeService,
    private Logger: ILogger
  ) {}

  async execute(input: string) {
    const payment = await this.PaymentRepository.getPaymentById(input);

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

    await this.TicketCountRepository.incrementCountByEventId(updatedPayment.eventId, updatedPayment.nfts.length);

    await Promise.all(
      updatedPayment.nfts.map((nft) =>
        this.EventBridgeService.sendEvent(`SendNFTToWallet_${process.env.ENV}`, "SEND_NFT", {
          id: updatedPayment.id,
          nftId: nft.id,
        })
      )
    );

    return { success: true, message: "Pago actualizado correctamente" };
  }
}
