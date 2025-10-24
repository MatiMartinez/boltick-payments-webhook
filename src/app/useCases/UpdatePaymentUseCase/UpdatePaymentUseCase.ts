import { NFT, Status } from "@domain/entities/PaymentEntity";
import { IUpdatePaymentUseCase, MercadopagoWebhookInput } from "./interface";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { ISQSService } from "@services/SQS/interface";
import { ILogger } from "@commons/Logger/interface";
import { IMercadoPagoService } from "@services/MercadoPago/interface";

export class UpdatePaymentUseCase implements IUpdatePaymentUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketCountRepository: ITicketCountRepository,
    private MercadoPagoService: IMercadoPagoService,
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

    await this.updateTicketCount(updatedPayment.eventId, updatedPayment.nfts);

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
