import * as jwt from "jsonwebtoken";

import { IJWTService } from "./interface";

export class JWTService implements IJWTService {
  private readonly secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      console.error("[JWTService.verifyToken] Error verifying token:", error);
      return null;
    }
  }
}
