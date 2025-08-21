import { Status } from "@domain/entities/PaymentEntity";
import { IUpdatePaymentUseCase, MercadopagoWebhookInput } from "./interface";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { ISQSService } from "@services/SQS/interface";
import { ILogger } from "@commons/Logger/interface";

export class UpdatePaymentUseCase implements IUpdatePaymentUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketCountRepository: ITicketCountRepository,
    private MercadoPagoService: MercadoPagoService,
    private SQSService: ISQSService,
    private Logger: ILogger
  ) {}

  async execute(input: MercadopagoWebhookInput) {
    const mercadoPagoPayment = await this.MercadoPagoService.getPayment(input.data.id);

    if (
      !mercadoPagoPayment ||
      !mercadoPagoPayment.external_reference ||
      mercadoPagoPayment.status !== "approved" ||
      (process.env.ENV === "PROD" ? !mercadoPagoPayment.live_mode : mercadoPagoPayment.live_mode)
    ) {
      this.Logger.error("[UpdatePaymentUseCase] Pago de Mercado Pago no encontrado: ", JSON.stringify({ input, mercadoPagoPayment }, null, 2));
      return true;
    }

    const payment = await this.PaymentRepository.getPaymentById(mercadoPagoPayment.external_reference);

    if (!payment) {
      this.Logger.error("[UpdatePaymentUseCase] Pago no encontrado: ", JSON.stringify({ input, payment }, null, 2));
      return true;
    }

    if (payment.paymentStatus !== "Pending") {
      this.Logger.error("[UpdatePaymentUseCase] Pago en estado distinto a pendiente: ", JSON.stringify({ input, payment }, null, 2));
      return true;
    }

    const updatedPayment = await this.PaymentRepository.updatePayment(payment.userId, payment.createdAt, {
      paymentStatus: this.generatePaymentStatus(mercadoPagoPayment.status),
      updatedAt: new Date().getTime(),
      paymentDetails: {
        amount: mercadoPagoPayment.transaction_amount as number,
        code: mercadoPagoPayment.id?.toString() as string,
        id: mercadoPagoPayment.id?.toString() as string,
        updatedAt: new Date().getTime(),
      },
    });

    if (updatedPayment.paymentStatus !== "Approved") {
      return true;
    }

    await this.TicketCountRepository.incrementCountByEventId(updatedPayment.eventId, updatedPayment.nfts.length);

    await Promise.all(
      updatedPayment.nfts.map((nft) => this.SQSService.sendMessage(updatedPayment.id, { action: "SEND_NFT", body: { id: updatedPayment.id, nftId: nft.id } }))
    );

    return true;
  }

  private generatePaymentStatus(mercadopago_status?: string): Status {
    if (mercadopago_status === "approved") return "Approved";
    if (mercadopago_status === "authorized") return "Pending";
    if (mercadopago_status === "in_process") return "Pending";
    if (mercadopago_status === "pending") return "Pending";
    return "Pending";
  }
}
