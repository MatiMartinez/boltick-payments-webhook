import express from "express";

import { Container } from "@containers/Container";

const Router = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();
const TicketController = Container.getInstance().getTicketController();

Router.post("/webhook-mercadopago", (req, res) => PaymentAPIController.UpdatePayment(req, res));
Router.post("/validate-entry", (req, res) => TicketController.ValidateEntry(req, res));

export { Router };
