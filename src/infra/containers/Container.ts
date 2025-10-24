import { ILogger } from "@commons/Logger/interface";
import { Logger } from "@commons/Logger/Logger";

import { IMercadoPagoService } from "@services/MercadoPago/interface";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { IS3Service } from "@services/S3/interface";
import { S3Service } from "@services/S3/S3Service";
import { ISolanaService } from "@services/Solana/interface";
import { SolanaService } from "@services/Solana/SolanaService";
import { ISQSService } from "@services/SQS/interface";
import { SQSService } from "@services/SQS/SQSService";

import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { PaymentDynamoRepository } from "@repositories/PaymentDynamoRepository";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { TicketCountDynamoRepository } from "@repositories/TicketCountDynamoRepository";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { TicketDynamoRepository } from "@repositories/TicketDynamoRepository";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { EventDynamoRepository } from "@repositories/EventDynamoRepository";
import { ITokenPaymentRepository } from "@domain/repositories/TokenPaymentRepository";
import { TokenPaymentDynamoRepository } from "@repositories/TokenPaymentDynamoRepository";

import { ISendNFTUseCase } from "@useCases/SendNFTUseCase/interface";
import { SendNFTUseCase } from "@useCases/SendNFTUseCase/SendNFTUseCase";
import { IUpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/interface";
import { UpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/UpdatePaymentUseCase";
import { IUpdateTokenPaymentUseCase } from "@useCases/UpdateTokenPaymentUseCase/interface";
import { UpdateTokenPaymentUseCase } from "@useCases/UpdateTokenPaymentUseCase/UpdateTokenPaymentUseCase";
import { UpdateFreePaymentUseCase } from "@useCases/UpdateFreePaymentUseCase/UpdateFreePaymentUseCase";
import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";
import { ValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/ValidateEntryUseCase";
import { IValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/interface";
import { ValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/ValidateManualEntryUseCase";
import { IGetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/interface";
import { GetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/GetTicketCountByEventIdUseCase";
import { ISendTokensUseCase } from "@useCases/SendTokensUseCase/interface";
import { SendTokensUseCase } from "@useCases/SendTokensUseCase/SendTokensUseCase";

import { PaymentAPIController } from "@controllers/PaymentAPIController";
import { PaymentSQSController } from "@controllers/PaymentSQSController";
import { TicketController } from "@controllers/TicketController";

export class Container {
  private static instance: Container;

  private Logger: ILogger;

  // Services
  private MercadoPagoService: IMercadoPagoService;
  private S3Service: IS3Service;
  private SolanaService: ISolanaService;
  private SQSService: ISQSService;

  // Repositories
  private PaymentRepository: IPaymentRepository;
  private TicketCountRepository: ITicketCountRepository;
  private TicketRepository: ITicketRepository;
  private EventRepository: IEventRepository;
  private TokenPaymentRepository: ITokenPaymentRepository;

  // Use Cases
  private SendNFTUseCase: ISendNFTUseCase;
  private UpdatePaymentUseCase: IUpdatePaymentUseCase;
  private UpdateTokenPaymentUseCase: IUpdateTokenPaymentUseCase;
  private UpdateFreePaymentUseCase: UpdateFreePaymentUseCase;
  private ValidateEntryUseCase: IValidateEntryUseCase;
  private ValidateManualEntryUseCase: IValidateManualEntryUseCase;
  private GetTicketCountByEventIdUseCase: IGetTicketCountByEventIdUseCase;
  private SendTokensUseCase: ISendTokensUseCase;

  // Controllers
  private PaymentAPIController: PaymentAPIController;
  private PaymentSQSController: PaymentSQSController;
  private TicketController: TicketController;

  private constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
    const apiKey = process.env.SOLANA_API_KEY as string;
    const selfApiKey = process.env.SELF_API_KEY as string;
    const sqsQueueUrl = process.env.SQS_QUEUE_URL as string;

    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN environment variable is required");
    }
    if (!apiKey) {
      throw new Error("SOLANA_API_KEY environment variable is required");
    }
    if (!selfApiKey) {
      throw new Error("SELF_API_KEY environment variable is required");
    }
    if (!sqsQueueUrl) {
      throw new Error("SQS_QUEUE_URL environment variable is required");
    }

    this.Logger = Logger.getInstance();

    // Initialize Services
    this.MercadoPagoService = new MercadoPagoService(accessToken);
    this.S3Service = new S3Service();
    this.SolanaService = new SolanaService(apiKey);
    this.SQSService = new SQSService(sqsQueueUrl, this.Logger);

    // Initialize Repositories
    this.PaymentRepository = new PaymentDynamoRepository(this.Logger);
    this.TicketCountRepository = new TicketCountDynamoRepository(this.Logger);
    this.TicketRepository = new TicketDynamoRepository(this.Logger);
    this.EventRepository = new EventDynamoRepository(this.Logger);
    this.TokenPaymentRepository = new TokenPaymentDynamoRepository(this.Logger);

    // Initialize Use Cases
    this.SendNFTUseCase = new SendNFTUseCase(
      this.PaymentRepository,
      this.TicketRepository,
      this.EventRepository,
      this.S3Service as S3Service,
      this.SolanaService as SolanaService,
      this.Logger
    );
    this.UpdatePaymentUseCase = new UpdatePaymentUseCase(
      this.PaymentRepository,
      this.TicketCountRepository,
      this.MercadoPagoService,
      this.SQSService,
      this.Logger
    );
    this.UpdateTokenPaymentUseCase = new UpdateTokenPaymentUseCase(this.TokenPaymentRepository, this.MercadoPagoService, this.SQSService, this.Logger);
    this.UpdateFreePaymentUseCase = new UpdateFreePaymentUseCase(this.PaymentRepository, this.TicketCountRepository, this.SQSService, this.Logger);
    this.ValidateEntryUseCase = new ValidateEntryUseCase(this.TicketRepository, this.S3Service, this.TicketCountRepository);
    this.ValidateManualEntryUseCase = new ValidateManualEntryUseCase(this.TicketRepository, this.S3Service, this.TicketCountRepository);
    this.GetTicketCountByEventIdUseCase = new GetTicketCountByEventIdUseCase(this.TicketCountRepository, this.Logger);
    this.SendTokensUseCase = new SendTokensUseCase(this.TokenPaymentRepository, this.SolanaService as SolanaService, this.Logger);

    // Initialize Controllers
    this.PaymentAPIController = new PaymentAPIController(this.UpdatePaymentUseCase, this.UpdateFreePaymentUseCase, this.UpdateTokenPaymentUseCase);
    this.PaymentSQSController = new PaymentSQSController(this.SendNFTUseCase, this.SendTokensUseCase, this.Logger);
    this.TicketController = new TicketController(this.ValidateEntryUseCase, this.ValidateManualEntryUseCase, this.GetTicketCountByEventIdUseCase);
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
