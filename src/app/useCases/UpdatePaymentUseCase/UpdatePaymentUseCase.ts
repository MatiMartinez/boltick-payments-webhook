import { PaymentEntity, Status } from "@domain/entities/PaymentEntity";
import { IUpdatePaymentUseCase, MercadopagoWebhookInput } from "./interface";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { EventBridgeService } from "@services/EventBridge/EventBridgeService";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";

export class UpdatePaymentUseCase implements IUpdatePaymentUseCase {
  constructor(
    private PaymentRepository: IPaymentRepository,
    private MercadoPagoService: MercadoPagoService,
    private EventBridgeService: EventBridgeService
  ) {}

  async execute(input: MercadopagoWebhookInput) {
    const payment = await this.PaymentRepository.getPaymentById(input.id);

    if (payment.paymentStatus !== "Pending") {
      console.log("Payment in status other than pending.");
      return true;
    }

    const mercadoPagoPayment = await this.MercadoPagoService.getPayment(
      input.id
    );

    const updatedPayment = await this.PaymentRepository.updatePayment(
      payment.userId,
      payment.createdAt,
      {
        paymentStatus: this.generatePaymentStatus(mercadoPagoPayment.status),
        updatedAt: new Date().getTime(),
        paymentDetails: {
          amount: mercadoPagoPayment.transaction_amount as number,
          code: mercadoPagoPayment.authorization_code as string,
          id: mercadoPagoPayment.id?.toString() as string,
          updatedAt: new Date().getTime(),
        },
      }
    );

    if (updatedPayment.paymentStatus !== "Approved") {
      return true;
    }

    await Promise.all(
      updatedPayment.nfts.map(async (nft) => {
        await this.EventBridgeService.sendEvent(
          "SendNFTToWallet_QA",
          "SEND_NFT",
          {
            id: updatedPayment.id,
            nftId: nft.id,
          }
        );
      })
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
