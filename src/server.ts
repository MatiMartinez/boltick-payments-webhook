import express from "express";

import { paymentRoutes } from "@routes/Payment";
import { ticketRoutes } from "@routes/Ticket";
import { Container } from "@containers/Container";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", paymentRoutes);
app.use("/api/tickets", ticketRoutes);

app.post("/test-sqs", async (req, res) => {
  const PaymentSQSController = Container.getInstance().getPaymentSQSController();
  const result = await PaymentSQSController.dispatch(req.body);
  res.json(result);
});

export { app };
