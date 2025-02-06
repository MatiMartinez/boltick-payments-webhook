export interface MercadopagoWebhookDTO {
  data: {
    id: string;
  };
  id: string;
  live_mode: boolean;
  type: 'payment';
}
