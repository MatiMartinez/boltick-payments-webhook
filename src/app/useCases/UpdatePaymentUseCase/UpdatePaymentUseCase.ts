import { Status } from "@domain/entities/PaymentEntity";
import { IUpdatePaymentUseCase, MercadopagoWebhookInput } from "./interface";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { EventBridgeService } from "@services/EventBridge/EventBridgeService";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";

export class UpdatePaymentUseCase implements IUpdatePaymentUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private TicketCountRepository: ITicketCountRepository,
    private MercadoPagoService: MercadoPagoService,
    private EventBridgeService: EventBridgeService
  ) {}

  async execute(input: MercadopagoWebhookInput) {
    const mercadoPagoPayment = await this.MercadoPagoService.getPayment(input.data.id);

    if (
      !mercadoPagoPayment ||
      !mercadoPagoPayment.external_reference ||
      mercadoPagoPayment.status !== "approved" ||
      !mercadoPagoPayment.live_mode
    ) {
      console.log("Mercado Pago payment not found: ", JSON.stringify({ input, mercadoPagoPayment }));
      return true;
    }

    const payment = await this.PaymentRepository.getPaymentById(mercadoPagoPayment.external_reference);

    if (!payment) {
      console.log("Payment not found: ", JSON.stringify({ input, payment }));
      return true;
    }

    if (payment.paymentStatus !== "Pending") {
      console.log("Payment in status other than pending.");
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

    // await Promise.all(
    //   updatedPayment.nfts.map(async (nft) => {
    //     await this.EventBridgeService.sendEvent(`SendNFTToWallet_${process.env.ENV}`, "SEND_NFT", {
    //       id: updatedPayment.id,
    //       nftId: nft.id,
    //     });
    //   })
    // );

    for (let i = 0; i < updatedPayment.nfts.length; i++) {
      const nft = updatedPayment.nfts[i];

      await this.EventBridgeService.sendEvent(`SendNFTToWallet_${process.env.ENV}`, "SEND_NFT", {
        id: updatedPayment.id,
        nftId: nft.id,
      });

      if (i < updatedPayment.nfts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

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
