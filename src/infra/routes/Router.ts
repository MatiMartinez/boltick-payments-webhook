import express from "express";
import { Container } from "@containers/Container";

const Router = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();
const TicketController = Container.getInstance().getTicketController();
const PRController = Container.getInstance().getPRController();

Router.post("/webhook-mercadopago", (req, res) => PaymentAPIController.UpdatePayment(req, res));
// Router.post("/update-free-payment", (req, res) => PaymentAPIController.UpdateFreePayment(req, res));

Router.post("/validate-entry", (req, res) => TicketController.ValidateEntry(req, res));
Router.post("/validate-manual-entry", (req, res) => TicketController.ValidateManualEntry(req, res));
Router.get("/ticket-count/:id", (req, res) => TicketController.GetTicketCountByEventId(req, res));

Router.get("/prs/:producer", (req, res) => PRController.GetPRsByProducer(req, res));
Router.post("/prs", (req, res) => PRController.CreatePR(req, res));
Router.put("/prs", (req, res) => PRController.UpdatePR(req, res));

export { Router };
