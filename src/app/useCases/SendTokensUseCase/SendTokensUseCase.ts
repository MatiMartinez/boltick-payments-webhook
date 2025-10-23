import { TokenPaymentEntity } from "@domain/entities/TokenPaymentEntity";
import { ISendTokensUseCase, SendTokensInput } from "./interface";
import { ITokenPaymentRepository } from "@domain/repositories/TokenPaymentRepository";
import { ILogger } from "@commons/Logger/interface";
import { ISolanaService } from "@services/Solana/interface";

export class SendTokensUseCase implements ISendTokensUseCase {
  constructor(
    private TokenPaymentRepository: ITokenPaymentRepository,
    private SolanaService: ISolanaService,
    private Logger: ILogger
  ) {}

  async execute(input: SendTokensInput) {
    const payment = await this.validatePayment(input);

    await this.SolanaService.mintBOLT(payment.walletPublicKey, payment.paymentDetails.amount);

    this.Logger.info("[SendTokensUseCase] Procesando envío de tokens", {
      paymentId: payment.id,
      walletAddress: payment.walletPublicKey,
      amount: payment.paymentDetails?.amount ?? 0,
    });

    await this.TokenPaymentRepository.updateTokensSent(payment.userId, payment.createdAt, { tokensSent: "Sent", updatedAt: new Date().getTime() });

    return true;
  }

  private async validatePayment(input: SendTokensInput): Promise<TokenPaymentEntity> {
    const payment = await this.TokenPaymentRepository.getPaymentById(input.id);
    if (!payment) {
      this.Logger.error("[SendTokensUseCase] No se encontró el pago: ", JSON.stringify({ input }, null, 2));
      throw new Error("No se encontró el pago");
    }

    if (payment.paymentStatus !== "Approved") {
      this.Logger.error("[SendTokensUseCase] Pago no aprobado: ", JSON.stringify({ input, payment }, null, 2));
      throw new Error("Pago no aprobado");
    }

    if (!payment.paymentDetails?.amount || payment.paymentDetails?.amount <= 0) {
      this.Logger.error("[SendTokensUseCase] Cantidad de tokens inválida: ", JSON.stringify({ input, payment }, null, 2));
      throw new Error("Cantidad de tokens inválida o no especificada");
    }

    return payment;
  }
}
