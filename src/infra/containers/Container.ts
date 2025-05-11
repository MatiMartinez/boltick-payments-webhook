import { EventBridgeService } from '@services/EventBridge/EventBridgeService';
import { MercadoPagoService } from '@services/MercadoPago/MercadoPagoService';
import { S3Service } from '@services/S3/S3Service';
import { SolanaService } from '@services/Solana/SolanaService';
import { PaymentRepository } from '@repositories/PaymentRepository';
import { SendNFTUseCase } from '@useCases/SendNFT';
import { UpdatePaymentUseCase } from '@useCases/UpdatePayment';
import { PaymentAPIController } from '@controllers/PaymentAPIController';
import { PaymentSQSController } from '@controllers/PaymentSQSController';

export class Container {
  private static instance: Container;

  private EventBridgeService: EventBridgeService;
  private MercadoPagoService: MercadoPagoService;
  private S3Service: S3Service;
  private SolanaService: SolanaService;
  private PaymentRepository: PaymentRepository;
  private SendNFTUseCase: SendNFTUseCase;
  private UpdatePaymentUseCase: UpdatePaymentUseCase;
  private PaymentAPIController: PaymentAPIController;
  private PaymentSQSController: PaymentSQSController;

  private constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN as string;

    this.EventBridgeService = new EventBridgeService();
    this.MercadoPagoService = new MercadoPagoService(accessToken);
    this.S3Service = new S3Service();
    this.SolanaService = new SolanaService('devnet');
    this.PaymentRepository = new PaymentRepository();
    this.SendNFTUseCase = new SendNFTUseCase(this.PaymentRepository, this.S3Service, this.SolanaService);
    this.UpdatePaymentUseCase = new UpdatePaymentUseCase(
      this.PaymentRepository,
      this.MercadoPagoService,
      this.EventBridgeService
    );
    this.PaymentAPIController = new PaymentAPIController(this.UpdatePaymentUseCase);
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
