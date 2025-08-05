import express from 'express';

import { Container } from '@containers/Container';

const ticketRoutes = express.Router();

const TicketController = Container.getInstance().getTicketController();

ticketRoutes.post('/validate-entry', (req, res) => TicketController.ValidateEntry(req, res));

export { ticketRoutes };
