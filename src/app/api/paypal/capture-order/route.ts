
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
  const supabase = createClient(cookieStore); 

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Error en capture-order: Usuario no autenticado o error de autenticación.', authError);
      return NextResponse.json({ error: 'Usuario no autenticado. Por favor, inicie sesión e intente de nuevo.' }, { status: 401 });
    }

    console.log(`Usuario autenticado para captura de orden: ${user.id}, email: ${user.email}`);

    // 2. Get the orderID from the request body
    const { orderID } = await request.json();

    if (!orderID) {
      console.error('Error en capture-order: orderID no proporcionado.');
      return NextResponse.json({ error: 'orderID de PayPal no proporcionado en la solicitud.' }, { status: 400 });
    }

    // 3. Capture the PayPal order
    const paypalClient = getPayPalClient();
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({}); // Empty body for capture

    console.log(`Intentando capturar orden PayPal ${orderID} para usuario ${user.id}`);
    const captureResponse = await paypalClient.execute(captureRequest);
    console.log("Respuesta de captura de PayPal:", JSON.stringify(captureResponse.result, null, 2));

    if (captureResponse.statusCode !== 201 || !captureResponse.result || captureResponse.result.status !== 'COMPLETED') {
      console.error(`Error al capturar orden PayPal ${orderID}. Status: ${captureResponse.statusCode}, Result Status: ${captureResponse.result?.status}`);
      return NextResponse.json({ error: `No se pudo capturar el pago. Estado de PayPal: ${captureResponse.result?.status || captureResponse.statusCode}` }, { status: captureResponse.statusCode || 500 });
    }

    // PAGO CAPTURADO EXITOSAMENTE
    const paymentDetails = captureResponse.result;
    console.log(`Orden PayPal ${paymentDetails.id} capturada exitosamente para usuario ${user.id}.`);

    // ***********************************************************************************
    // TODO CRUCIAL: Actualizar la base de datos Supabase ('user_profiles') aquí.
    // ***********************************************************************************
    // 1. Determinar la duración de la suscripción (ej. 30 días para mensual).
    // 2. Calcular la nueva fecha de 'current_period_end'.
    // 3. Usar el 'user.id' para actualizar la fila correspondiente en 'user_profiles'.
    //    - Cambiar 'subscription_status' a 'active_premium' (o el plan específico).
    //    - Establecer 'current_period_end'.
    //    - Guardar 'paypal_order_id' (paymentDetails.id) para referencia.
    //    - Establecer 'updated_at' a la fecha actual.
    //
    // Ejemplo conceptual usando el cliente Supabase del lado del servidor:
    // IMPORTANTE: Para esta operación de actualización (especialmente si tienes RLS estrictas),
    // puede que necesites un cliente Supabase inicializado con la SUPABASE_SERVICE_ROLE_KEY
    // si la política RLS del usuario no le permite modificar su propio subscription_status.
    // Por simplicidad, asumimos que `supabase` (creado con cookies de usuario) podría tener permiso si
    // la política RLS lo permite, o que tendrías que crear un cliente de servicio aquí.

    /*
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // Ejemplo: 30 días

    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        subscription_status: 'active_premium', // O el identificador de plan correcto
        current_period_end: subscriptionEndDate.toISOString(),
        paypal_order_id: paymentDetails.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select(); // Opcional: .select() para obtener el perfil actualizado

    if (updateError) {
      console.error(`Error al actualizar el perfil del usuario ${user.id} en Supabase tras el pago:`, updateError);
      // Considerar cómo manejar este error crítico. 
      // ¿Se reembolsa el pago automáticamente? ¿Se notifica al administrador?
      // Por ahora, se devuelve un error que el frontend podría manejar.
      // Idealmente, aquí se registraría el problema y se intentaría una recuperación o notificación.
      return NextResponse.json({ 
        message: 'Pago capturado, pero error al actualizar suscripción. Contacte soporte.',
        error: 'Error actualizando perfil de usuario en base de datos.',
        orderID: paymentDetails.id,
        paymentDetails: paymentDetails 
      }, { status: 500 }); // Error del servidor porque no se pudo completar la lógica de negocio
    }
    console.log(`Perfil de usuario ${user.id} actualizado en Supabase a premium:`, updateData);
    */
    
    // Por ahora, sin la actualización de BD real, solo devolvemos éxito si la captura de PayPal fue OK.
    // El frontend llamará a refreshUserProfile() para intentar obtener el nuevo estado.
    return NextResponse.json({ 
      message: 'Pago capturado exitosamente. El estado de su suscripción se actualizará pronto.', 
      orderID: paymentDetails.id,
      paymentDetails: paymentDetails 
    });

  } catch (error: any) {
    console.error('Error crítico en API /paypal/capture-order:', error);
    let errorMessage = 'Error interno del servidor al capturar la orden de PayPal.';
    if (error.message && error.message.includes('Configuración de PayPal incompleta')) {
      errorMessage = error.message;
    } else if (error.statusCode && error.message && typeof error.message === 'string') { // PayPal SDK errors
      errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
      // PayPal SDK error.data can be a string or an object.
      const paypalErrorData = error.data || (error.original && error.original.data); // Check nested original error for some SDK versions
      if (paypalErrorData && typeof paypalErrorData === 'object' && paypalErrorData.details) {
        errorMessage += ` Detalles: ${JSON.stringify(paypalErrorData.details)}`;
      } else if (paypalErrorData && typeof paypalErrorData === 'object' && paypalErrorData.message) {
        errorMessage += ` Mensaje de PayPal: ${paypalErrorData.message}`;
      } else if (typeof paypalErrorData === 'string') {
        errorMessage += ` Detalles: ${paypalErrorData}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
