import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configura el cliente PayPal con credenciales y entorno
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com'; // Sandbox por defecto

  console.log("PAYPAL_CLIENT_ID:", clientId ? clientId.substring(0, 5) + "..." : "NO DEFINIDO");
  console.log("PAYPAL_CLIENT_SECRET:", clientSecret ? clientSecret.substring(0, 5) + "..." : "NO DEFINIDO");
  console.log("PAYPAL_API_BASE_URL:", baseUrl);

  if (!clientId) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_ID no está configurado.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (!clientSecret) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_SECRET no está configurado.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error("Error al parsear JSON:", e);
    return NextResponse.json(
      { error: "Cuerpo inválido o malformado.", details: (e as Error).message },
      { status: 400 }
    );
  }

  const orderAmount = typeof body?.orderAmount === 'string' && body.orderAmount.trim() !== '' ? body.orderAmount : '10.00';
  const currencyCode = typeof body?.currencyCode === 'string' && body.currencyCode.trim() !== '' ? body.currencyCode : 'USD';
  const description = typeof body?.description === 'string' && body.description.trim() !== '' ? body.description : 'Suscripción Premium - Centro de Análisis de Seguridad Integral';

  try {
    const paypalClient = getPayPalClient();

    const bodyPayload = {
      intent: 'CAPTURE' as const,
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: orderAmount,
          },
          description,
        },
      ],
      application_context: {
        brand_name: 'Centro de Análisis de Seguridad Integral',
        shipping_preference: 'NO_SHIPPING' as const,
        user_action: 'PAY_NOW' as const,
      },
    };

    console.log("Enviando orden a PayPal:", JSON.stringify(bodyPayload, null, 2));

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer('return=representation');
    paypalRequest.requestBody(bodyPayload);

    const response = await paypalClient.execute(paypalRequest);

    if (response.statusCode !== 201 || !response.result?.id) {
      console.error('Error al crear la orden en PayPal:', response);
      return NextResponse.json(
        {
          error: `No se pudo crear la orden. Código: ${response.statusCode}`,
          details: response.result ? JSON.stringify(response.result) : 'Sin detalles.',
        },
        { status: response.statusCode || 500 }
      );
    }

    console.log("Orden creada con éxito. ID:", response.result.id);
    return NextResponse.json({ orderID: response.result.id });

  } catch (error: any) {
    console.error('Error creando orden PayPal:', error);

    let errorMessage = 'Error interno al crear la orden.';
    let errorDetails = error.message || String(error);

    if (error.message?.includes('CRITICAL_SERVER_ERROR')) {
      errorMessage = error.message;
    } else if (error.message?.includes('Authentication failed') || (error.data && JSON.stringify(error.data).includes('invalid_client'))) {
      errorMessage = 'Credenciales inválidas de PayPal.';
      errorDetails = error.data ? JSON.stringify(error.data) : errorDetails;
    } else if (error.statusCode && typeof error.message === 'string') {
      errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
      const data = error.data || error.original?.data;
      if (data?.details) {
        errorDetails = JSON.stringify(data.details);
      } else if (data?.message) {
        errorDetails = data.message;
      } else if (typeof data === 'string') {
        errorDetails = data;
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
