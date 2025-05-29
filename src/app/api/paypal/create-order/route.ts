import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configura el cliente PayPal con credenciales y entorno
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com'; // Sandbox por defecto

  console.log("PAYPAL_CLIENT_ID (desde process.env en API):", clientId ? clientId.substring(0, 5) + "..." : "NO DEFINIDO");
  console.log("PAYPAL_CLIENT_SECRET (desde process.env en API):", clientSecret ? clientSecret.substring(0, 5) + "..." : "NO DEFINIDO");
  console.log("PAYPAL_API_BASE_URL (desde process.env en API o default):", baseUrl);


  if (!clientId) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_ID no está configurado en las variables de entorno del servidor. No se puede inicializar el cliente PayPal. Verifique su archivo .env.local y reinicie el servidor.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (!clientSecret) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_SECRET no está configurado en las variables de entorno del servidor. No se puede inicializar el cliente PayPal. Verifique su archivo .env.local y reinicie el servidor.';
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
    console.error("Error al parsear el cuerpo de la solicitud JSON en /api/paypal/create-order:", e);
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido o no es JSON.", details: (e as Error).message }, { status: 400 });
  }

  const requestedAmount = body?.orderAmount;
  const requestedCurrency = body?.currencyCode;
  const requestedDescription = body?.description;

  // Usar valores por defecto si no se proporcionan o son inválidos
  const orderAmount = typeof requestedAmount === 'string' && requestedAmount.trim() !== '' ? requestedAmount : '10.00';
  const currencyCode = typeof requestedCurrency === 'string' && requestedCurrency.trim() !== '' ? requestedCurrency : 'USD';
  const description = typeof requestedDescription === 'string' && requestedDescription.trim() !== '' ? requestedDescription : 'Suscripción Premium - Centro de Análisis de Seguridad Integral';


  try {
    const paypalClient = getPayPalClient();
    
    const bodyPayload = {
      intent: 'CAPTURE' as 'CAPTURE',
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
        shipping_preference: 'NO_SHIPPING' as 'NO_SHIPPING',
        user_action: 'PAY_NOW' as 'PAY_NOW',
      },
    };
    
    console.log("Intentando crear orden en PayPal con el siguiente cuerpo (RUTA API):", JSON.stringify(bodyPayload, null, 2));

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer('return=representation');
    paypalRequest.requestBody(bodyPayload);


    const response = await paypalClient.execute(paypalRequest);

    if (response.statusCode !== 201 || !response.result?.id) {
      console.error('Respuesta inesperada de PayPal al crear orden (RUTA API):', response);
      // Intenta obtener más detalles del error si están disponibles
      const errorDetails = response.result ? JSON.stringify(response.result) : 'Sin detalles adicionales de PayPal.';
      return NextResponse.json({
        error: `No se pudo crear la orden de PayPal. Código: ${response.statusCode}`,
        details: errorDetails,
      }, { status: response.statusCode || 500 });
    }

    console.log("Orden PayPal creada con éxito en backend (RUTA API). Order ID:", response.result.id);
    return NextResponse.json({ orderID: response.result.id });

  } catch (error: any) {
    console.error('Error crítico al crear orden PayPal en /api/paypal/create-order (RUTA API):', error);
    
    let errorMessage = 'Error interno del servidor al crear la orden de PayPal.';
    let errorDetails = error.message || String(error);

    if (error.message?.includes('CRITICAL_SERVER_ERROR')) {
      // Errores de configuración de variables de entorno ya detectados por getPayPalClient
      errorMessage = error.message;
    } else if (error.message?.includes('Authentication failed') || (error.data && JSON.stringify(error.data).includes('invalid_client'))) {
      errorMessage = 'Credenciales inválidas de PayPal. Verifica PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.';
      errorDetails = error.data ? JSON.stringify(error.data) : errorDetails;
    } else if (error.statusCode && error.message && typeof error.message === 'string') { 
      errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
      const paypalErrorData = error.data || (error.original && error.original.data);
      if (paypalErrorData && typeof paypalErrorData === 'object' && (paypalErrorData as any).details) {
        errorDetails = JSON.stringify((paypalErrorData as any).details);
      } else if (paypalErrorData && typeof paypalErrorData === 'object' && (paypalErrorData as any).message) {
        errorDetails = (paypalErrorData as any).message;
      } else if (typeof paypalErrorData === 'string') {
        errorDetails = paypalErrorData;
      }
    }
    
    return NextResponse.json({
      error