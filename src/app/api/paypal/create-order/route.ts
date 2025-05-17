
// /src/app/api/paypal/create-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Helper function to configure PayPal client
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com'; // Default to sandbox

  if (!clientId || !clientSecret) {
    console.error('PayPal Client ID o Client Secret no están configurados en las variables de entorno.');
    throw new Error('Configuración de PayPal incompleta en el servidor. PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET faltan.');
  }

  // For Sandbox, use SandboxEnvironment. For Live, use LiveEnvironment.
  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
  
  const client = new paypal.core.PayPalHttpClient(environment);
  // Modificar el user-agent para pruebas de Sandbox si es necesario, o para identificar tu app
  // client.setUserAgent("NombreDeTuApp/1.0 (IntegracionNextJS)"); 
  return client;
}

export async function POST(request: Request) {
  try {
    const paypalClient = getPayPalClient();
    // Asegúrate de que el frontend envía estos datos, o usa valores fijos para la simulación
    const { orderAmount = '10.00', currencyCode = 'USD', description = 'Suscripción Premium - Centro de Análisis de Seguridad Integral' } = await request.json().catch(() => ({}));


    if (parseFloat(orderAmount) <= 0) {
        return NextResponse.json({ error: 'El monto de la orden debe ser mayor que cero.' }, { status: 400 });
    }

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer('return=representation');
    paypalRequest.requestBody({
      intent: 'CAPTURE', // Or 'AUTHORIZE'
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode, 
            value: orderAmount,       
          },
          description: description,
        },
      ],
      application_context: {
        brand_name: 'Centro de Análisis de Seguridad Integral',
        shipping_preference: 'NO_SHIPPING', // Para bienes digitales
        user_action: 'PAY_NOW', // o 'CONTINUE' si es un flujo de autorización
        // return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`, // URL a donde redirigir tras pago exitoso (opcional si manejas todo con JS SDK)
        // cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`, // URL si el usuario cancela (opcional)
      },
    });

    console.log("Intentando crear orden en PayPal con el siguiente cuerpo:", JSON.stringify(paypalRequest.requestBody(), null, 2));

    const response = await paypalClient.execute(paypalRequest);

    if (response.statusCode !== 201 || !response.result || !response.result.id) {
      console.error('Error al crear orden PayPal, respuesta inesperada:', response);
      return NextResponse.json({ error: `No se pudo crear la orden de PayPal. Estado: ${response.statusCode}` }, { status: response.statusCode || 500 });
    }
    
    console.log("Orden PayPal creada exitosamente. Order ID:", response.result.id);
    return NextResponse.json({ orderID: response.result.id });

  } catch (error: any) {
    console.error('Error crítico en API /paypal/create-order:', error);
    let errorMessage = 'Error interno del servidor al crear la orden de PayPal.';
    
    if (error.message && error.message.includes('Configuración de PayPal incompleta')) {
        errorMessage = error.message;
    } else if (error.message && (error.message.includes('Invalid Credentials') || error.message.includes('Authentication failed'))) {
        errorMessage = 'Credenciales de PayPal API inválidas. Verifique PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.';
    } else if (error.statusCode && error.message) { // PayPal SDK errors
        errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
        if (error.data && error.data.details) {
            errorMessage += ` Detalles: ${JSON.stringify(error.data.details)}`;
        } else if (error.data && error.data.message) {
            errorMessage += ` Mensaje de PayPal: ${error.data.message}`;
        }
    } else if (error.isAxiosError && error.response) { // Errors from raw HTTP requests if SDK uses Axios internally
        errorMessage = `Error de red con PayPal (${error.response.status}): ${error.response.data ? JSON.stringify(error.response.data) : error.message}`;
    } else if (error.message) {
        errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
