import express from 'express';
import { paymentRoutes } from '@routes/Payment';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', paymentRoutes);

export { app };
