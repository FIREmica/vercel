import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configura el cliente PayPal con credenciales y entorno
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com'; // Sandbox por defecto

  if (!clientId || !clientSecret) {
    console.error('PayPal Client ID o Client Secret no están configurados.');
    throw new Error('Faltan PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET en el entorno.');
  }

  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
  try {
    const paypalClient = getPayPalClient();
    const { orderAmount = '10.00', currencyCode = 'USD', description = 'Suscripción Premium' } = await request.json().catch(() => ({}));

    if (parseFloat(orderAmount) <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor que cero.' }, { status: 400 });
    }

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: orderAmount,
          },
          custom_id: description, // Aquí puedes usar description si no usas ítems detallados
        },
      ],
      application_context: {
        brand_name: 'Centro de Análisis de Seguridad Integral',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer('return=representation');
    paypalRequest.requestBody(orderData);

    console.log("Creando orden PayPal con:", JSON.stringify(orderData, null, 2));

    const response = await paypalClient.execute(paypalRequest);

    if (response.statusCode !== 201 || !response.result?.id) {
      console.error('Respuesta inesperada de PayPal:', response);
      return NextResponse.json({
        error: `No se pudo crear la orden. Código: ${response.statusCode}`,
        details: response.result ? JSON.stringify(response.result) : 'Sin detalles.',
      }, { status: response.statusCode || 500 });
    }

    console.log("Orden PayPal creada con éxito. Order ID:", response.result.id);
    return NextResponse.json({ orderID: response.result.id });

  } catch (error: any) {
    console.error('Error al crear orden PayPal:', error);

    let errorMessage = 'Error interno al crear la orden.';
    if (error.message?.includes('Configuración de PayPal incompleta')) {
      errorMessage = error.message;
    } else if (error.message?.includes('Authentication failed')) {
      errorMessage = 'Credenciales inválidas de PayPal. Verifica PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.';
    } else if (error.statusCode && error.message) {
      errorMessage = `Error PayPal (${error.statusCode}): ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    const errorDetails = error.data ? JSON.stringify(error.data) : String(error);

    return NextResponse.json({
      error: errorMessage,
      details: errorDetails,
    }, { status: 500 });
  }
}
