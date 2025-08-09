import express from "express";
import { Container } from "@containers/Container";
import { ApiKeyMiddleware } from "@middlewares/ApiKeyMiddleware";

const Router = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();
const TicketController = Container.getInstance().getTicketController();

Router.post("/webhook-mercadopago", (req, res) => PaymentAPIController.UpdatePayment(req, res));
Router.post("/validate-entry", ApiKeyMiddleware.validateApiKey, (req, res) => TicketController.ValidateEntry(req, res));
Router.post("/validate-manual-entry", ApiKeyMiddleware.validateApiKey, (req, res) => TicketController.ValidateManualEntry(req, res));

export { Router };
