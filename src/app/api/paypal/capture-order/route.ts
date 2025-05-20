// /src/app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createServerClient as createServerSupabaseClient } from '@/lib/supabase/server'; 
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper function to configure PayPal client
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('Error en PayPal Client: PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no están configurados.');
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
  const supabaseUserClient = createServerSupabaseClient(cookieStore); 

  // For updating user_profiles with service_role privileges
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error en capture-order: Variables de entorno de Supabase para cliente admin no configuradas (URL o SERVICE_ROLE_KEY).');
    return NextResponse.json({ error: 'Configuración del servidor incompleta para operaciones de base de datos (admin).' }, { status: 500 });
  }
  // Initialize Supabase admin client for database updates
  const supabaseAdminClient = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

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
    

    if (captureResponse.statusCode !== 201 || !captureResponse.result || captureResponse.result.status !== 'COMPLETED') {
      console.error(`Error al capturar orden PayPal ${orderID}. Status: ${captureResponse.statusCode}, Result Status: ${captureResponse.result?.status}, Details: ${JSON.stringify(captureResponse.result?.details)}`);
      return NextResponse.json({ error: `No se pudo capturar el pago. Estado de PayPal: ${captureResponse.result?.status || captureResponse.statusCode}` }, { status: captureResponse.statusCode || 500 });
    }

    // PAGO CAPTURADO EXITOSAMENTE EN PAYPAL
    const paymentDetails = captureResponse.result;
    console.log(`Orden PayPal ${paymentDetails.id} capturada exitosamente en PayPal para usuario ${user.id}.`);

    // 4. Actualizar la base de datos Supabase ('user_profiles') con el cliente admin
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // Suscripción de 30 días

    console.log(`Actualizando perfil de usuario ${user.id} en Supabase a premium...`);
    const { data: updateData, error: updateError } = await supabaseAdminClient
      .from('user_profiles')
      .update({ 
        subscription_status: 'active_premium',
        current_period_end: subscriptionEndDate.toISOString(),
        paypal_order_id: paymentDetails.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select(); 

    if (updateError) {
      console.error(`Error al actualizar el perfil del usuario ${user.id} en Supabase tras el pago:`, updateError);
      // El pago en PayPal ya fue capturado. Se debería notificar al administrador
      // y posiblemente ofrecer al usuario una forma de contactar soporte.
      return NextResponse.json({ 
        message: 'Pago capturado en PayPal, pero hubo un error al actualizar su suscripción en nuestra base de datos. Por favor, contacte a soporte con su ID de orden de PayPal.',
        error: `Error actualizando perfil de usuario en base de datos: ${updateError.message}`,
        paypalOrderId: paymentDetails.id,
        paypalStatus: paymentDetails.status,
      }, { status: 500 }); 
    }
    
    console.log(`Perfil de usuario ${user.id} actualizado en Supabase a premium:`, updateData);
    
    return NextResponse.json({ 
      message: '¡Pago capturado y suscripción actualizada exitosamente!', 
      orderID: paymentDetails.id,
      paymentDetails: paymentDetails 
    });

  } catch (error: any) {
    console.error('Error crítico en API /paypal/capture-order:', error);
    let errorMessage = 'Error interno del servidor al capturar la orden de PayPal.';
    if (error.message && error.message.includes('Configuración de PayPal incompleta')) {
      errorMessage = error.message;
    } else if (error.message && (error.message.includes('UNPROCESSABLE_ENTITY') || (error.data && (error.data as any).details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED'))) {
      errorMessage = 'Esta orden de PayPal ya ha sido capturada previamente.';
      // Podrías querer verificar el estado de la suscripción en la DB aquí y responder acorde
      return NextResponse.json({ message: errorMessage, orderID: (await request.json().catch(() => ({ orderID: 'unknown' }))).orderID  }, { status: 200 }); // O 400 si se considera un error del cliente
    } else if (error.statusCode && error.message && typeof error.message === 'string') { 
      errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
      const paypalErrorData = error.data || (error.original && error.original.data); 
      if (paypalErrorData && typeof paypalErrorData === 'object' && (paypalErrorData as any).details) {
        errorMessage += ` Detalles: ${JSON.stringify((paypalErrorData as any).details)}`;
      } else if (paypalErrorData && typeof paypalErrorData === 'object' && (paypalErrorData as any).message) {
        errorMessage += ` Mensaje de PayPal: ${(paypalErrorData as any).message}`;
      } else if (typeof paypalErrorData === 'string') {
        errorMessage += ` Detalles: ${paypalErrorData}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}