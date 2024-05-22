import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { ISnsService, PaymentConfirmationPayload } from './sns.interface';

export const sendPaymentConfirmation = (payload: PaymentConfirmationPayload) => {
  const { amount, id, transaction_code, transaction_date, user } = payload;

  const sesClient = new SESClient({ region: 'us-east-1' });
};

export class SnsService implements ISnsService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({ region: 'us-east-1' });
  }

  sendPaymentConfirmation = async (payload: PaymentConfirmationPayload) => {
    const { amount, id, transaction_code, transaction_date, user } = payload;

    const html = `
    <html>
      <head>
        <title>Confirmación de Ticket</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" />
      </head>
      <body style="font-family: 'Poppins', sans-serif">
        <table width="100%">
          <tr>
            <td align="center" style="border: none; padding: 0">
              <div style="max-width: 700px">
                <div style="background-color: #2f855a; padding-block: 24px">
                  <h2 align="center" style="color: white; margin: 0">Boltick</h2>
                </div>

                <br />
    
                <table width="100%" border="0" style="border-collapse: separate">
                  <tr>
                    <td style="padding-bottom: 8px; margin: 0">
                      <h3 style="margin: 0">¡Hey, gracias por tu compra en Boltick!</h3>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0; margin: 0">
                      <p style="margin: 0">
                        ¡Todo listo! Recibimos tu pago a través de Mercado Pago sin problemas. Queremos que sepas que
                        estamos super contentos de tenerte a bordo. A continuación, encontrarás más detalles sobre tu pago y
                        lo que sigue. Si tienes preguntas o necesitas una mano con algo, estamos aquí para ti.
                      </p>
                    </td>
                  </tr>
                </table>
    
                <br />
    
                <table
                  width="100%"
                  border="0"
                  cellpadding="6"
                  style="border-collapse: separate; border: 1px solid; border-radius: 16px; padding: 16px"
                >
                  <tr border="none">
                    <th colspan="4" align="left" style="border: none">
                      <h3 style="margin: 0">Información de compra</h3>
                    </th>
                  </tr>
                  <tr>
                    <th colspan="2" align="left" style="border: none">Código de compra</th>
                    <td colspan="2" align="left" style="border: none">${id}</td>
                  </tr>
                  <tr>
                    <th colspan="2" align="left" style="border: none">Fecha y Hora</th>
                    <td colspan="2" align="left" style="border: none">${transaction_date}</td>
                  </tr>
                  <tr>
                    <th colspan="2" align="left" style="border: none">Código de operación</th>
                    <td colspan="2" align="left" style="border: none">${transaction_code}</td>
                  </tr>
                  <tr>
                    <th colspan="2" align="left" style="border: none">Importe</th>
                    <td colspan="2" align="left" style="border: none">${amount}</td>
                  </tr>
                </table>
    
                <br />
    
                <p>
                  En nuestra misión de cuidar el planeta, tu entrada será un código QR ecológico que recibirás dos días
                  antes del evento. Mantén un ojo en tu correo para el código QR y gracias por apoyar la ecología junto a
                  nosotros.
                </p>

                <div style="background-color: #2f855a; padding-block: 12px">
                  <p align="center" style="color: white; margin: 0">
                    Encuentranos en
                    <strong
                      ><a href="https://boltick.com.ar/" target="_blank" style="color: white">boltick.com.ar</a></strong
                    >
                  </p>
                </div>

                <div style="background-color: #333333; padding-block: 12px">
                  <p align="center" style="color: white; margin: 0; font-size: 14px">
                    &copy; 2024 Boltick. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>

    
    `;

    await this.sesClient.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [user] },
        Message: { Body: { Html: { Data: html } }, Subject: { Data: 'Confirmación de Compra - Boltick' } },
        Source: 'contacto@boltick.com.ar',
      })
    );
  };
}
