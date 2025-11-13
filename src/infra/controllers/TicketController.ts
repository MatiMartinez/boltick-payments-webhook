import { Request, Response } from "express";

import { IGetFreeTicketsByEventIdUseCase } from "@useCases/GetFreeTicketsByEventIdUseCase/interface";
import { IGetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/interface";
import { IRedeemFreeTicketUseCase } from "@useCases/RedeemFreeTicketUseCase/interface";
import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";
import { IValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/interface";

export class TicketController {
  constructor(
    private ValidateEntryUseCase: IValidateEntryUseCase,
    private ValidateManualEntryUseCase: IValidateManualEntryUseCase,
    private GetTicketCountByEventIdUseCase: IGetTicketCountByEventIdUseCase,
    private RedeemFreeTicketUseCase: IRedeemFreeTicketUseCase,
    private GetFreeTicketsByEventIdUseCase: IGetFreeTicketsByEventIdUseCase
  ) {}

  async ValidateEntry(req: Request, res: Response): Promise<void> {
    try {
      const token = req.body.token as string;
      const result = await this.ValidateEntryUseCase.execute({ token });
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error validating entry:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async ValidateManualEntry(req: Request, res: Response): Promise<void> {
    try {
      const ticketNumber = req.body.ticketNumber as string;
      const result = await this.ValidateManualEntryUseCase.execute({ ticketNumber });
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error validating manual entry:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async GetTicketCountByEventId(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id as string;
      const result = await this.GetTicketCountByEventIdUseCase.execute(eventId);
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error getting ticket count by event id:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async RedeemFreeTicket(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, ticketType, walletPublicKey } = req.body;

      // Obtener userId del usuario autenticado (agregado por el middleware de Cognito)
      const userId = (req as any).user?.username || (req as any).user?.attributes?.sub;

      if (!eventId || !ticketType || !walletPublicKey) {
        res.status(400).json({ error: "eventId, ticketType y walletPublicKey son requeridos" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const result = await this.RedeemFreeTicketUseCase.execute({
        eventId,
        ticketType,
        walletPublicKey,
        userId,
      });

      if (result.result) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error redeeming free ticket:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async GetFreeTicketsByEventId(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id as string;

      if (!eventId) {
        res.status(400).json({ error: "eventId es requerido" });
        return;
      }

      const result = await this.GetFreeTicketsByEventIdUseCase.execute(eventId);

      if (result.result) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error getting free tickets by event id:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
}
