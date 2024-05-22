import { getPaymentDB, updatePaymentDB } from '../../repository/payment.dynamo';
import { getPaymentStatus } from '../../service/mercadopago/mercadopago.service';

export const updatePaymentMercadopagoWebhook = async (payload: { id: string }) => {
  const { id } = payload;

  const newPayment = await getPaymentStatus(id);

  const currentPayment = await getPaymentDB(id);
  if (currentPayment.status === 'Approved') return true;

  const updatedPayment = await updatePaymentDB(newPayment);

  if (updatedPayment.status === 'Approved') {
    console.log('Enviar email de notificacion.');
  }

  return true;
};
