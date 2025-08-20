import { v4 as uuidv4 } from "uuid";
import { ILogger } from "./interface";

export class Logger implements ILogger {
  private static instance: Logger;
  private logId: string;

  private constructor() {
    this.logId = uuidv4();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, data?: any): void {
    console.log(
      JSON.stringify({
        logId: this.logId,
        message,
        data: data || null,
      })
    );
  }

  public error(message: string, data?: any): void {
    console.error(
      JSON.stringify({
        logId: this.logId,
        message,
        data: data || null,
      })
    );
  }

  public warn(message: string, data?: any): void {
    console.warn(
      JSON.stringify({
        logId: this.logId,
        message,
        data: data || null,
      })
    );
  }

  public debug(message: string, data?: any): void {
    console.debug(
      JSON.stringify({
        logId: this.logId,
        message,
        data: data || null,
      })
    );
  }
}
