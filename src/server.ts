import express from "express";
import cors from "cors";
import { Router } from "@routes/Router";

const app = express();

app.use(
  cors({
    origin: "*",
    allowedHeaders: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
    maxAge: 86400,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", Router);

export { app };
