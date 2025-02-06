import express from 'express';

import { Container } from '@containers/Container';

const paymentRoutes = express.Router();

const paymentController = Container.getInstance().getPaymentController();

paymentRoutes.post('/webhook-mercadopago', (req, res) => paymentController.UpdatePayment(req, res));
paymentRoutes.post('/send-nft', (req, res) => paymentController.SendNFT(req, res));

export { paymentRoutes };
