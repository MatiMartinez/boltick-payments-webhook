import { ITicketService } from "./interface";

export class TicketService implements ITicketService {
  generateId(collectionSymbol: string, eventEdition: number): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomLetter2 = letters.charAt(Math.floor(Math.random() * letters.length));

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    const prefix = collectionSymbol.substring(0, 3).toUpperCase();
    const eventCode = eventEdition.toString().padStart(2, "0");

    return `${prefix}${eventCode}-${randomLetter1}${randomLetter2}${randomDigits}`;
  }
}
