import { EventDynamoRepository } from "@repositories/EventDynamoRepository";
import { GetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/GetTicketCountByEventIdUseCase";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { IGetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/interface";
import { ILogger } from "@commons/Logger/interface";
import { IRedeemFreeTicketUseCase } from "@useCases/RedeemFreeTicketUseCase/interface";
import { ISQSService } from "@services/SQS/interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";
import { IValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/interface";
import { Logger } from "@commons/Logger/Logger";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { PaymentAPIController } from "@controllers/PaymentAPIController";
import { PaymentDynamoRepository } from "@repositories/PaymentDynamoRepository";
import { PaymentSQSController } from "@controllers/PaymentSQSController";
import { RedeemFreeTicketUseCase } from "@useCases/RedeemFreeTicketUseCase/RedeemFreeTicketUseCase";
import { S3Service } from "@services/S3/S3Service";
import { SQSService } from "@services/SQS/SQSService";
import { SendNFTUseCase } from "@useCases/SendNFTUseCase/SendNFTUseCase";
import { SolanaService } from "@services/Solana/SolanaService";
import { TicketController } from "@controllers/TicketController";
import { TicketCountDynamoRepository } from "@repositories/TicketCountDynamoRepository";
import { TicketDynamoRepository } from "@repositories/TicketDynamoRepository";
import { UpdateFreePaymentUseCase } from "@useCases/UpdateFreePaymentUseCase/UpdateFreePaymentUseCase";
import { UpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/UpdatePaymentUseCase";
import { ValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/ValidateEntryUseCase";
import { ValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/ValidateManualEntryUseCase";

export class Container {
  private static instance: Container;

  private Logger: ILogger;

  private MercadoPagoService: MercadoPagoService;
  private S3Service: S3Service;
  private SolanaService: SolanaService;
  private SQSService: ISQSService;

  private PaymentRepository: PaymentDynamoRepository;
  private TicketCountRepository: TicketCountDynamoRepository;
  private TicketRepository: ITicketRepository;
  private EventRepository: IEventRepository;

  private SendNFTUseCase: SendNFTUseCase;
  private UpdatePaymentUseCase: UpdatePaymentUseCase;
  private UpdateFreePaymentUseCase: UpdateFreePaymentUseCase;
  private ValidateEntryUseCase: IValidateEntryUseCase;
  private ValidateManualEntryUseCase: IValidateManualEntryUseCase;
  private GetTicketCountByEventIdUseCase: IGetTicketCountByEventIdUseCase;
  private RedeemFreeTicketUseCase: IRedeemFreeTicketUseCase;

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

    this.MercadoPagoService = new MercadoPagoService(accessToken);
    this.S3Service = new S3Service();
    this.SolanaService = new SolanaService(apiKey);
    this.SQSService = new SQSService(sqsQueueUrl, this.Logger);

    this.PaymentRepository = new PaymentDynamoRepository(this.Logger);
    this.TicketCountRepository = new TicketCountDynamoRepository(this.Logger);
    this.TicketRepository = new TicketDynamoRepository(this.Logger);
    this.EventRepository = new EventDynamoRepository(this.Logger);

    this.SendNFTUseCase = new SendNFTUseCase(
      this.PaymentRepository,
      this.TicketRepository,
      this.EventRepository,
      this.S3Service,
      this.SolanaService,
      this.Logger
    );
    this.UpdatePaymentUseCase = new UpdatePaymentUseCase(
      this.PaymentRepository,
      this.TicketCountRepository,
      this.MercadoPagoService,
      this.SQSService,
      this.Logger
    );
    this.UpdateFreePaymentUseCase = new UpdateFreePaymentUseCase(
      this.PaymentRepository,
      this.TicketCountRepository,
      this.SQSService,
      this.Logger
    );
    this.ValidateEntryUseCase = new ValidateEntryUseCase(
      this.TicketRepository,
      this.S3Service,
      this.TicketCountRepository
    );
    this.ValidateManualEntryUseCase = new ValidateManualEntryUseCase(
      this.TicketRepository,
      this.S3Service,
      this.TicketCountRepository
    );
    this.GetTicketCountByEventIdUseCase = new GetTicketCountByEventIdUseCase(
      this.TicketCountRepository,
      this.Logger
    );
    this.RedeemFreeTicketUseCase = new RedeemFreeTicketUseCase(
      this.EventRepository,
      this.TicketRepository,
      this.TicketCountRepository,
      this.S3Service,
      this.SolanaService,
      this.Logger
    );

    this.PaymentAPIController = new PaymentAPIController(
      this.UpdatePaymentUseCase,
      this.UpdateFreePaymentUseCase
    );
    this.PaymentSQSController = new PaymentSQSController(this.SendNFTUseCase, this.Logger);
    this.TicketController = new TicketController(
      this.ValidateEntryUseCase,
      this.ValidateManualEntryUseCase,
      this.GetTicketCountByEventIdUseCase,
      this.RedeemFreeTicketUseCase
    );
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
