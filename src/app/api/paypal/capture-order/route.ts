// /src/app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createClient } from '@/lib/supabase/server'; // For server-side Supabase access
import { cookies } from 'next/headers';

// Helper function to configure PayPal client
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('PayPal Client ID o Client Secret no están configurados en las variables de entorno.');
    throw new Error('Configuración de PayPal incompleta en el servidor. PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET faltan.');
  }

  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
  
  const client = new paypal.core.PayPalHttpClient(environment);
  return client;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); // Pass cookieStore for server client

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Error en capture-order: Usuario no autenticado.');
      return NextResponse.json({ error: 'Usuario no autenticado. Por favor, inicie sesión e intente de nuevo.' }, { status: 401 });
    }

    const { orderID } = await request.json();

    if (!orderID) {
      console.error('Error en capture-order: orderID no proporcionado.');
      return NextResponse.json({ error: 'orderID de PayPal no proporcionado en la solicitud.' }, { status: 400 });
    }

    const paypalClient = getPayPalClient();
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({}); // Empty body for capture

    console.log(`Intentando capturar orden PayPal ${orderID} para usuario ${user.id}`);
    const captureResponse = await paypalClient.execute(captureRequest);
    console.log("Respuesta de captura de PayPal:", JSON.stringify(captureResponse, null, 2));

    if (captureResponse.statusCode !== 201 || !captureResponse.result || captureResponse.result.status !== 'COMPLETED') {
      console.error(`Error al capturar orden PayPal ${orderID}. Estado: ${captureResponse.statusCode}, Resultado: ${captureResponse.result?.status}`);
      return NextResponse.json({ error: `No se pudo capturar el pago. Estado de PayPal: ${captureResponse.result?.status || captureResponse.statusCode}` }, { status: captureResponse.statusCode || 500 });
    }

    // PAGO CAPTURADO EXITOSAMENTE
    console.log(`Orden PayPal ${orderID} capturada exitosamente para usuario ${user.id}.`);

    // TODO: Implementar la actualización de la base de datos Supabase aquí.
    // 1. Determinar la duración de la suscripción (ej. 30 días para mensual).
    // 2. Calcular la nueva fecha de 'current_period_end'.
    // 3. Actualizar la tabla 'user_profiles' para el 'user.id'.
    //    Ejemplo conceptual (necesitarás el cliente Supabase del lado del servidor):
    /*
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        subscription_status: 'active_premium', // o el plan específico
        current_period_end: thirtyDaysFromNow.toISOString(),
        paypal_order_id: orderID, // Opcional, para referencia
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Error al actualizar el perfil del usuario ${user.id} en Supabase tras el pago:`, updateError);
      // Considerar cómo manejar este error. ¿Se reembolsa el pago? ¿Se notifica al admin?
      // Por ahora, devolvemos éxito al cliente pero registramos el fallo de actualización de DB.
      return NextResponse.json({ 
        message: 'Pago capturado exitosamente, pero hubo un problema al actualizar el estado de su suscripción. Por favor, contacte a soporte.',
        orderID: captureResponse.result.id,
        paymentDetails: captureResponse.result 
      }, { status: 207 }); // 207 Multi-Status, ya que el pago fue ok, pero la actualización falló.
    }

    console.log(`Perfil de usuario ${user.id} actualizado en Supabase a premium.`);
    */
    
    // Por ahora, sin la actualización de BD, solo devolvemos éxito.
    // El frontend dependerá de que AuthContext se refresque para ver el cambio de estado.
    return NextResponse.json({ 
      message: 'Pago capturado exitosamente. Estado de suscripción (simulado/TODO) actualizado.', 
      orderID: captureResponse.result.id,
      paymentDetails: captureResponse.result 
    });

  } catch (error: any) {
    console.error('Error crítico en API /paypal/capture-order:', error);
    let errorMessage = 'Error interno del servidor al capturar la orden de PayPal.';
    if (error.message && error.message.includes('Configuración de PayPal incompleta')) {
      errorMessage = error.message;
    } else if (error.statusCode && error.message) { // PayPal SDK errors
      errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
      if (error.data && error.data.details) {
        errorMessage += ` Detalles: ${JSON.stringify(error.data.details)}`;
      } else if (error.data && error.data.message) {
        errorMessage += ` Mensaje de PayPal: ${error.data.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}