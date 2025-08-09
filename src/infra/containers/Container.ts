import { EventBridgeService } from "@services/EventBridge/EventBridgeService";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { S3Service } from "@services/S3/S3Service";
import { SolanaService } from "@services/Solana/SolanaService";

import { PaymentDynamoRepository } from "@repositories/PaymentDynamoRepository";
import { TicketCountDynamoRepository } from "@repositories/TicketCountDynamoRepository";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { TicketDynamoRepository } from "@repositories/TicketDynamoRepository";

import { SendNFTUseCase } from "@useCases/SendNFTUseCase/SendNFTUseCase";
import { UpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/UpdatePaymentUseCase";
import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";
import { ValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/ValidateEntryUseCase";
import { IValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/interface";
import { ValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/ValidateManualEntryUseCase";
import { PaymentAPIController } from "@controllers/PaymentAPIController";
import { PaymentSQSController } from "@controllers/PaymentSQSController";
import { TicketController } from "@controllers/TicketController";

export class Container {
  private static instance: Container;

  private EventBridgeService: EventBridgeService;
  private MercadoPagoService: MercadoPagoService;
  private S3Service: S3Service;
  private SolanaService: SolanaService;

  private PaymentRepository: PaymentDynamoRepository;
  private TicketCountRepository: TicketCountDynamoRepository;
  private TicketRepository: ITicketRepository;

  private SendNFTUseCase: SendNFTUseCase;
  private UpdatePaymentUseCase: UpdatePaymentUseCase;
  private ValidateEntryUseCase: IValidateEntryUseCase;
  private ValidateManualEntryUseCase: IValidateManualEntryUseCase;

  private PaymentAPIController: PaymentAPIController;
  private PaymentSQSController: PaymentSQSController;
  private TicketController: TicketController;

  private constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
    const apiKey = process.env.SOLANA_API_KEY as string;
    const selfApiKey = process.env.SELF_API_KEY as string;

    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN environment variable is required");
    }
    if (!apiKey) {
      throw new Error("SOLANA_API_KEY environment variable is required");
    }
    if (!selfApiKey) {
      throw new Error("SELF_API_KEY environment variable is required");
    }

    this.EventBridgeService = new EventBridgeService();
    this.MercadoPagoService = new MercadoPagoService(accessToken);
    this.S3Service = new S3Service();
    this.SolanaService = new SolanaService(apiKey);
    this.PaymentRepository = new PaymentDynamoRepository();
    this.TicketCountRepository = new TicketCountDynamoRepository();
    this.TicketRepository = new TicketDynamoRepository();
    this.SendNFTUseCase = new SendNFTUseCase(this.PaymentRepository, this.TicketRepository, this.S3Service, this.SolanaService);
    this.UpdatePaymentUseCase = new UpdatePaymentUseCase(
      this.PaymentRepository,
      this.TicketCountRepository,
      this.MercadoPagoService,
      this.EventBridgeService
    );
    this.ValidateEntryUseCase = new ValidateEntryUseCase(this.TicketRepository, this.S3Service);
    this.ValidateManualEntryUseCase = new ValidateManualEntryUseCase(this.TicketRepository, this.S3Service);
    this.PaymentAPIController = new PaymentAPIController(this.UpdatePaymentUseCase);
    this.PaymentSQSController = new PaymentSQSController(this.SendNFTUseCase);
    this.TicketController = new TicketController(this.ValidateEntryUseCase, this.ValidateManualEntryUseCase);
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

  public getTicketController(): TicketController {
    return this.TicketController;
  }
}
