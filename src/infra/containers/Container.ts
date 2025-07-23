import { EventBridgeService } from "@services/EventBridge/EventBridgeService";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";
import { PaymentDynamoRepository } from "@repositories/PaymentDynamoRepository";
import { SendNFTUseCase } from "@useCases/SendNFTUseCase/SendNFTUseCase";
import { UpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/UpdatePaymentUseCase";
import { PaymentAPIController } from "@controllers/PaymentAPIController";
import { PaymentSQSController } from "@controllers/PaymentSQSController";
import { TicketCountDynamoRepository } from "@repositories/TicketCountDynamoRepository";

export class Container {
  private static instance: Container;

  private EventBridgeService: EventBridgeService;
  private MercadoPagoService: MercadoPagoService;
  private S3Service: S3Service;
  private SolanaService: SolanaService;
  private PaymentRepository: PaymentDynamoRepository;
  private TicketCountRepository: TicketCountDynamoRepository;
  private SendNFTUseCase: SendNFTUseCase;
  private UpdatePaymentUseCase: UpdatePaymentUseCase;
  private PaymentAPIController: PaymentAPIController;
  private PaymentSQSController: PaymentSQSController;

  private constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
    const apiKey = process.env.SOLANA_API_KEY as string;

    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN environment variable is required"
      );
    }

    if (!apiKey) {
      throw new Error("SOLANA_API_KEY environment variable is required");
    }

    this.EventBridgeService = new EventBridgeService();
    this.MercadoPagoService = new MercadoPagoService(accessToken);
    this.S3Service = new S3Service();
    this.SolanaService = new SolanaService(apiKey);
    this.PaymentRepository = new PaymentDynamoRepository();
    this.TicketCountRepository = new TicketCountDynamoRepository();
    this.SendNFTUseCase = new SendNFTUseCase(
      this.PaymentRepository,
      this.S3Service,
      this.SolanaService
    );
    this.UpdatePaymentUseCase = new UpdatePaymentUseCase(
      this.PaymentRepository,
      this.TicketCountRepository,
      this.MercadoPagoService,
      this.EventBridgeService
    );
    this.PaymentAPIController = new PaymentAPIController(
      this.UpdatePaymentUseCase
    );
    this.PaymentSQSController = new PaymentSQSController(this.SendNFTUseCase);
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public getPaymentAPIController(): PaymentAPIController {
    return this.PaymentAPIController;
  }

  public getPaymentSQSController(): PaymentSQSController {
    return this.PaymentSQSController;
  }
}
