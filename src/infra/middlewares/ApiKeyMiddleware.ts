import { Request, Response, NextFunction } from "express";

export class ApiKeyMiddleware {
  private static readonly SELF_API_KEY = process.env.SELF_API_KEY;

  public static validateApiKey(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(401).json({ result: 0, message: "API Key requerida" });
      return;
    }

    if (apiKey !== ApiKeyMiddleware.SELF_API_KEY) {
      res.status(401).json({ result: 0, message: "API Key inválida" });
      return;
    }

    next();
  }
}
