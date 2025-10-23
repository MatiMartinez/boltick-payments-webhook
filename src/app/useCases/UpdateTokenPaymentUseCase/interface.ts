export interface IUpdateTokenPaymentUseCase {
  execute(input: MercadopagoWebhookInput): Promise<boolean>;
}

export interface MercadopagoWebhookInput {
  data: {
    id: string;
  };
  id: string;
  live_mode: boolean;
  type: "payment";
}
