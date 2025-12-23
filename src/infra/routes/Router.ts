import express from "express";
import { Container } from "@containers/Container";

const Router = express.Router();

const PaymentAPIController = Container.getInstance().getPaymentAPIController();
const TicketController = Container.getInstance().getTicketController();
const PRController = Container.getInstance().getPRController();
const EventController = Container.getInstance().getEventController();
const CloudFrontController = Container.getInstance().getCloudFrontController();

Router.post("/webhook-mercadopago", (req, res) => PaymentAPIController.UpdatePayment(req, res));
// Router.post("/update-free-payment", (req, res) => PaymentAPIController.UpdateFreePayment(req, res));

Router.post("/validate-entry", (req, res) => TicketController.ValidateEntry(req, res));
Router.post("/validate-manual-entry", (req, res) => TicketController.ValidateManualEntry(req, res));
Router.get("/ticket-count/:id", (req, res) => TicketController.GetTicketCountByEventId(req, res));

Router.get("/prs/:producer", (req, res) => PRController.GetPRsByProducer(req, res));
Router.post("/prs", (req, res) => PRController.CreatePR(req, res));
Router.put("/prs", (req, res) => PRController.UpdatePR(req, res));
Router.delete("/prs", (req, res) => PRController.DeletePR(req, res));

Router.get("/events/:eventId/count", (req, res) => EventController.GetTicketCountByEventId(req, res));
Router.get("/events/producer/:producer", (req, res) => EventController.GetEventsByProducer(req, res));
Router.get("/events/:id", (req, res) => EventController.GetEventById(req, res));
Router.put("/events/:id", (req, res) => EventController.UpdateEvent(req, res));

Router.post("/cloudfront/invalidate-all", (req, res) => CloudFrontController.InvalidateAll(req, res));

Router.post("/redeem-free-ticket", (req, res) => TicketController.RedeemFreeTicket(req, res));
Router.post("/tickets/by-category", (req, res) => TicketController.GetTicketsByEventCategory(req, res));

export { Router };
