import { Status } from "@domain/entities/TokenPaymentEntity";
import { IUpdateTokenPaymentUseCase, MercadopagoWebhookInput } from "./interface";
import { IMercadoPagoService } from "@services/MercadoPago/interface";
import { ITokenPaymentRepository } from "@domain/repositories/TokenPaymentRepository";
import { ISQSService } from "@services/SQS/interface";
import { ILogger } from "@commons/Logger/interface";

export class UpdateTokenPaymentUseCase implements IUpdateTokenPaymentUseCase {
  constructor(
    private TokenPaymentRepository: ITokenPaymentRepository,
    private MercadoPagoService: IMercadoPagoService,
    private SQSService: ISQSService,
    private Logger: ILogger
  ) {}

  async execute(input: MercadopagoWebhookInput) {
    const mercadoPagoPayment = await this.MercadoPagoService.getPayment(input.data.id);

    if (!mercadoPagoPayment || !mercadoPagoPayment.external_reference || mercadoPagoPayment.status !== "approved") {
      this.Logger.error("[UpdateTokenPaymentUseCase] Pago de Mercado Pago no encontrado: ", JSON.stringify({ input, mercadoPagoPayment }, null, 2));
      return true;
    }

    const payment = await this.TokenPaymentRepository.getPaymentById(mercadoPagoPayment.external_reference);

    if (!payment) {
      this.Logger.error("[UpdateTokenPaymentUseCase] Pago no encontrado: ", JSON.stringify({ input, payment }, null, 2));
      return true;
    }

    if (payment.paymentStatus !== "Pending") {
      this.Logger.error("[UpdateTokenPaymentUseCase] Pago en estado distinto a pendiente: ", JSON.stringify({ input, payment }, null, 2));
      return true;
    }

    const updatedPayment = await this.TokenPaymentRepository.updatePayment(payment.userId, payment.createdAt, {
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

    await this.SQSService.sendMessage(updatedPayment.id, { action: "SEND_TOKENS", body: { id: updatedPayment.id } });

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
