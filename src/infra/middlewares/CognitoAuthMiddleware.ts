import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextFunction, Request, Response } from "express";

export const cognitoAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const region = "us-east-1";
    const accessToken = req.headers["authorization"] as string;

    if (!accessToken) {
      res.status(401).json({ error: "Token de acceso requerido" });
      return;
    }

    // Remover "Bearer " si está presente
    const token = accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken;

    const client = new CognitoIdentityProviderClient({ region });

    const command = new GetUserCommand({
      AccessToken: token,
    });

    // Validar el token con Cognito
    const response = await client.send(command);

    // Agregar información del usuario al request para uso posterior
    (req as any).user = {
      username: response.Username,
      attributes: response.UserAttributes?.reduce(
        (acc, attr) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    };

    next();
  } catch (error) {
    console.error("Error validating Cognito token:", error);
    const err = error as Error;

    if (err.name === "NotAuthorizedException" || err.name === "UserNotFoundException") {
      res.status(401).json({ error: "Token inválido o expirado" });
      return;
    }

    res.status(401).json({ error: "No autorizado" });
    return;
  }
};
