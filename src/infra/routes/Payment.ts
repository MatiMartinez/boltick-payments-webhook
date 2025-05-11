import express from 'express';

import { Container } from '@containers/Container';

const paymentRoutes = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();

paymentRoutes.post('/webhook-mercadopago', (req, res) => PaymentAPIController.UpdatePayment(req, res));

export { paymentRoutes };
