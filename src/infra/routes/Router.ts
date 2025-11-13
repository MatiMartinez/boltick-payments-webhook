import { Container } from "@containers/Container";
import { cognitoAuthMiddleware } from "@middlewares/CognitoAuthMiddleware";
import express from "express";

const Router = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();
const TicketController = Container.getInstance().getTicketController();

Router.post("/webhook-mercadopago", (req, res) => PaymentAPIController.UpdatePayment(req, res));
// Router.post("/update-free-payment", (req, res) => PaymentAPIController.UpdateFreePayment(req, res));

Router.post("/validate-entry", (req, res) => TicketController.ValidateEntry(req, res));
Router.post("/validate-manual-entry", (req, res) => TicketController.ValidateManualEntry(req, res));
Router.get("/ticket-count/:id", (req, res) => TicketController.GetTicketCountByEventId(req, res));

Router.post("/redeem-free-ticket", cognitoAuthMiddleware, (req, res) =>
  TicketController.RedeemFreeTicket(req, res)
);
Router.get("/free-tickets/:id", cognitoAuthMiddleware, (req, res) =>
  TicketController.GetFreeTicketsByEventId(req, res)
);

export { Router };
