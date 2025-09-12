import express from "express";
import { Container } from "@containers/Container";

const Router = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();
const TicketController = Container.getInstance().getTicketController();

Router.post("/webhook-mercadopago", (req, res) => PaymentAPIController.UpdatePayment(req, res));
// Router.post("/update-free-payment", (req, res) => PaymentAPIController.UpdateFreePayment(req, res));

Router.post("/validate-entry", (req, res) => TicketController.ValidateEntry(req, res));
Router.post("/validate-manual-entry", (req, res) => TicketController.ValidateManualEntry(req, res));
Router.get("/ticket-count/:eventId", (req, res) => TicketController.GetTicketCountByEventId(req, res));

export { Router };
