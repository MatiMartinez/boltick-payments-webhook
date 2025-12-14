import { CloudFrontController } from "@controllers/CloudFrontController";
import { CloudFrontService } from "@services/CloudFront/CloudFrontService";
import { CreatePRUseCase } from "@useCases/CreatePRUseCase/CreatePRUseCase";
import { DeletePRUseCase } from "@useCases/DeletePRUseCase/DeletePRUseCase";
import { EventController } from "@controllers/EventController";
import { EventDynamoRepository } from "@repositories/EventDynamoRepository";
import { GetEventByIdUseCase } from "@useCases/GetEventByIdUseCase/GetEventByIdUseCase";
import { GetEventsByProducerUseCase } from "@useCases/GetEventsByProducerUseCase/GetEventsByProducerUseCase";
import { GetPRsByProducerUseCase } from "@useCases/GetPRsByProducerUseCase/GetPRsByProducerUseCase";
import { GetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/GetTicketCountByEventIdUseCase";
import { ICloudFrontService } from "@services/CloudFront/interface";
import { ICreatePRUseCase } from "@useCases/CreatePRUseCase/interface";
import { IDeletePRUseCase } from "@useCases/DeletePRUseCase/interface";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { IGetEventByIdUseCase } from "@useCases/GetEventByIdUseCase/interface";
import { IGetEventsByProducerUseCase } from "@useCases/GetEventsByProducerUseCase/interface";
import { IGetPRsByProducerUseCase } from "@useCases/GetPRsByProducerUseCase/interface";
import { IGetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/interface";
import { IInvalidarCloudFrontUseCase } from "@useCases/InvalidarCloudFrontUseCase/interface";
import { ILogger } from "@commons/Logger/interface";
import { IPRRepository } from "@domain/repositories/IPRRepository";
import { ISQSService } from "@services/SQS/interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { IUpdateEventUseCase } from "@useCases/UpdateEventUseCase/interface";
import { IUpdatePRUseCase } from "@useCases/UpdatePRUseCase/interface";
import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";
import { IValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/interface";
import { InvalidarCloudFrontUseCase } from "@useCases/InvalidarCloudFrontUseCase/InvalidarCloudFrontUseCase";
import { Logger } from "@commons/Logger/Logger";
import { MercadoPagoService } from "@services/MercadoPago/MercadoPagoService";
import { PRController } from "@controllers/PRController";
import { PRDynamoRepository } from "@repositories/PRDynamoRepository";
import { PaymentAPIController } from "@controllers/PaymentAPIController";
import { PaymentDynamoRepository } from "@repositories/PaymentDynamoRepository";
import { PaymentSQSController } from "@controllers/PaymentSQSController";
import { S3Service } from "@services/S3/S3Service";
import { SQSService } from "@services/SQS/SQSService";
import { SendNFTUseCase } from "@useCases/SendNFTUseCase/SendNFTUseCase";
import { SolanaService } from "@services/Solana/SolanaService";
import { TicketController } from "@controllers/TicketController";
import { TicketCountDynamoRepository } from "@repositories/TicketCountDynamoRepository";
import { TicketDynamoRepository } from "@repositories/TicketDynamoRepository";
import { UpdateEventUseCase } from "@useCases/UpdateEventUseCase/UpdateEventUseCase";
import { UpdateFreePaymentUseCase } from "@useCases/UpdateFreePaymentUseCase/UpdateFreePaymentUseCase";
import { UpdatePRUseCase } from "@useCases/UpdatePRUseCase/UpdatePRUseCase";
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
  private CloudFrontService: ICloudFrontService;

  private PaymentRepository: PaymentDynamoRepository;
  private TicketCountRepository: TicketCountDynamoRepository;
  private TicketRepository: ITicketRepository;
  private EventRepository: IEventRepository;
  private PRRepository: IPRRepository;

  private SendNFTUseCase: SendNFTUseCase;
  private UpdatePaymentUseCase: UpdatePaymentUseCase;
  private UpdateFreePaymentUseCase: UpdateFreePaymentUseCase;
  private ValidateEntryUseCase: IValidateEntryUseCase;
  private ValidateManualEntryUseCase: IValidateManualEntryUseCase;
  private GetTicketCountByEventIdUseCase: IGetTicketCountByEventIdUseCase;
  private GetPRsByProducerUseCase: IGetPRsByProducerUseCase;
  private GetEventsByProducerUseCase: IGetEventsByProducerUseCase;
  private GetEventByIdUseCase: IGetEventByIdUseCase;
  private UpdateEventUseCase: IUpdateEventUseCase;
  private CreatePRUseCase: ICreatePRUseCase;
  private UpdatePRUseCase: IUpdatePRUseCase;
  private DeletePRUseCase: IDeletePRUseCase;
  private InvalidarCloudFrontUseCase: IInvalidarCloudFrontUseCase;

  private PaymentAPIController: PaymentAPIController;
  private PaymentSQSController: PaymentSQSController;
  private TicketController: TicketController;
  private PRController: PRController;
  private EventController: EventController;
  private CloudFrontController: CloudFrontController;

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
    this.CloudFrontService = new CloudFrontService();

    this.PaymentRepository = new PaymentDynamoRepository(this.Logger);
    this.TicketCountRepository = new TicketCountDynamoRepository(this.Logger);
    this.TicketRepository = new TicketDynamoRepository(this.Logger);
    this.EventRepository = new EventDynamoRepository(this.Logger);
    this.PRRepository = new PRDynamoRepository(this.Logger);

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
    this.GetPRsByProducerUseCase = new GetPRsByProducerUseCase(this.PRRepository, this.Logger);
    this.GetEventsByProducerUseCase = new GetEventsByProducerUseCase(
      this.EventRepository,
      this.Logger
    );
    this.GetEventByIdUseCase = new GetEventByIdUseCase(this.EventRepository, this.Logger);
    this.UpdateEventUseCase = new UpdateEventUseCase(this.EventRepository, this.Logger);
    this.CreatePRUseCase = new CreatePRUseCase(this.PRRepository, this.Logger);
    this.UpdatePRUseCase = new UpdatePRUseCase(this.PRRepository, this.Logger);
    this.DeletePRUseCase = new DeletePRUseCase(this.PRRepository, this.Logger);
    this.InvalidarCloudFrontUseCase = new InvalidarCloudFrontUseCase(
      this.CloudFrontService,
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
      this.GetTicketCountByEventIdUseCase
    );
    this.PRController = new PRController(
      this.GetPRsByProducerUseCase,
      this.CreatePRUseCase,
      this.UpdatePRUseCase,
      this.DeletePRUseCase
    );
    this.EventController = new EventController(
      this.GetEventsByProducerUseCase,
      this.GetTicketCountByEventIdUseCase,
      this.GetEventByIdUseCase,
      this.UpdateEventUseCase
    );
    this.CloudFrontController = new CloudFrontController(this.InvalidarCloudFrontUseCase);
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

  public getPRController(): PRController {
    return this.PRController;
  }

  public getEventController(): EventController {
    return this.EventController;
  }

  public getCloudFrontController(): CloudFrontController {
    return this.CloudFrontController;
  }
}
