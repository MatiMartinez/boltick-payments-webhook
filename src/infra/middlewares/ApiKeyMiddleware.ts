import { Request, Response, NextFunction } from "express";

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const SELF_API_KEY = process.env.SELF_API_KEY;

    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(401).json({ error: "API Key requerida" });
      return;
    }

    if (apiKey !== SELF_API_KEY) {
      res.status(401).json({ error: "API Key inválida" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error validating API key:", error);
    res.status(401).json({ error: "No tienes permisos para acceder a este recurso" });
    return;
  }
};
