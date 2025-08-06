import express from "express";

import { Router } from "@routes/Router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", Router);

export { app };
