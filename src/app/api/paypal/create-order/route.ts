// /src/app/api/paypal/create-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Helper function to configure PayPal client
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com'; // Default to sandbox

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID o Client Secret no están configurados en las variables de entorno.');
  }

  // For Sandbox, use SandboxEnvironment. For Live, use LiveEnvironment.
  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
  
  return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
  try {
    const paypalClient = getPayPalClient();
    const { orderAmount, currencyCode } = await request.json(); // Expect amount and currency from frontend

    if (!orderAmount || !currencyCode) {
      return NextResponse.json({ error: 'Monto y código de moneda son requeridos.' }, { status: 400 });
    }

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer('return=representation');
    paypalRequest.requestBody({
      intent: 'CAPTURE', // Or 'AUTHORIZE'
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode, // e.g., 'USD'
            value: orderAmount,       // e.g., '10.00' (for $10.00)
          },
          // You can add more details like description, items, etc.
          description: 'Suscripción Premium - Centro de Análisis de Seguridad Integral',
        },
      ],
      // You can configure application_context for return_url and cancel_url if needed
      // application_context: {
      //   return_url: 'https://example.com/paypal-return',
      //   cancel_url: 'https://example.com/paypal-cancel',
      //   brand_name: 'Centro de Análisis de Seguridad Integral',
      //   user_action: 'PAY_NOW',
      // },
    });

    const response = await paypalClient.execute(paypalRequest);

    if (response.statusCode !== 201) {
      console.error('Error al crear orden PayPal:', response);
      return NextResponse.json({ error: 'No se pudo crear la orden de PayPal.' }, { status: 500 });
    }
    
    // The orderID is what the PayPal JS SDK on the frontend will use
    return NextResponse.json({ orderID: response.result.id });

  } catch (error: any) {
    console.error('Error en API /paypal/create-order:', error);
    let errorMessage = 'Error interno del servidor al crear la orden de PayPal.';
    if (error.message && error.message.includes('PayPal Client ID o Client Secret no están configurados')) {
        errorMessage = error.message;
    } else if (error.statusCode && error.message) { // PayPal SDK errors often have statusCode
        errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
        if (error.data && error.data.details) {
            errorMessage += ` Detalles: ${JSON.stringify(error.data.details)}`;
        }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
