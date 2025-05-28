// /src/app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'; 
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'; // For service_role updates
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase'; 

// Helper function to configure PayPal client
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_ID no está configurado en las variables de entorno del servidor. No se puede inicializar el cliente PayPal para captura.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (!clientSecret) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_SECRET no está configurado en las variables de entorno del servidor. No se puede inicializar el cliente PayPal para captura.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
  
  return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  // Client for getting the authenticated user based on session cookies
  const supabaseUserClient = createServerSupabaseClient(cookieStore); 

  // Admin client for database updates requiring elevated privileges
  const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseAdminUrl) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada. No se puede inicializar el cliente admin de Supabase para captura.';
    console.error(errorMsg);
    return NextResponse.json({ error: errorMsg, details: 'Configuración del servidor incompleta (Supabase URL).' }, { status: 500 });
  }
  if (!supabaseServiceRoleKey) {
    const errorMsg = 'CRITICAL_SERVER_ERROR: SUPABASE_SERVICE_ROLE_KEY no está configurada. No se puede inicializar el cliente admin de Supabase para captura.';
    console.error(errorMsg);
    return NextResponse.json({ error: errorMsg, details: 'Configuración del servidor incompleta (Supabase Service Role Key).' }, { status: 500 });
  }
  
  const supabaseAdminClient = createAdminSupabaseClient<Database>(
    supabaseAdminUrl,
    supabaseServiceRoleKey
  );

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      console.error('Error en capture-order (RUTA API): Usuario no autenticado o error de autenticación.', authError);
      return NextResponse.json({ error: 'Usuario no autenticado. Por favor, inicie sesión e intente de nuevo.' }, { status: 401 });
    }

    console.log(`Usuario autenticado para captura de orden (RUTA API): ${user.id}, email: ${user.email}`);

    // 2. Get the orderID from the request body
    const { orderID } = await request.json();

    if (!orderID) {
      console.error('Error en capture-order (RUTA API): orderID no proporcionado.');
      return NextResponse.json({ error: 'orderID de PayPal no proporcionado en la solicitud.' }, { status: 400 });
    }

    // 3. Capture the PayPal order
    const paypalClient = getPayPalClient();
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({}); // Empty body for capture

    console.log(`Intentando capturar orden PayPal ${orderID} para usuario ${user.id} (RUTA API)`);
    const captureResponse = await paypalClient.execute(captureRequest);
    
    const paymentDetails = captureResponse.result;

    if (captureResponse.statusCode !== 201 || !paymentDetails || paymentDetails.status !== 'COMPLETED') {
      console.error(`Error al capturar orden PayPal ${orderID} (RUTA API). Status Code: ${captureResponse.statusCode}, Result Status: ${paymentDetails?.status}, Result Details: ${JSON.stringify(paymentDetails?.details)}`);
      return NextResponse.json({ error: `No se pudo capturar el pago. Estado de PayPal: ${paymentDetails?.status || captureResponse.statusCode}` }, { status: captureResponse.statusCode || 500 });
    }

    // PAGO CAPTURADO EXITOSAMENTE EN PAYPAL
    console.log(`Orden PayPal ${paymentDetails.id} capturada exitosamente en PayPal para usuario ${user.id} (RUTA API).`);

    // 4. Actualizar la base de datos Supabase ('user_profiles')
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // Suscripción de 30 días

    console.log(`Actualizando perfil de usuario ${user.id} en Supabase a premium (RUTA API)...`);
    const { data: updateData, error: updateError } = await supabaseAdminClient
      .from('user_profiles')
      .update({ 
        subscription_status: 'active_premium',
        current_period_end: subscriptionEndDate.toISOString(),
        paypal_order_id: paymentDetails.id, 
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single(); 

    if (updateError) {
      console.error(`Error al actualizar el perfil del usuario ${user.id} en Supabase tras el pago (RUTA API):`, updateError);
      return NextResponse.json({ 
        message: 'Pago capturado en PayPal, pero hubo un error al actualizar su suscripción en nuestra base de datos. Por favor, contacte a soporte con su ID de orden de PayPal.',
        error_details_db: `Error actualizando perfil de usuario en base de datos: ${updateError.message}`,
        paypalOrderId: paymentDetails.id,
        paypalStatus: paymentDetails.status,
      }, { status: 500 }); 
    }
    
    console.log(`Perfil de usuario ${user.id} actualizado en Supabase a premium (RUTA API):`, updateData);
    
    return NextResponse.json({ 
      message: '¡Pago capturado y suscripción actualizada exitosamente!', 
      orderID: paymentDetails.id,
      paymentDetails: paymentDetails,
      profileUpdate: updateData 
    });

  } catch (error: any) {
    console.error('Error crítico en API /paypal/capture-order (RUTA API):', error);
    let errorMessage = 'Error interno del servidor al capturar la orden de PayPal.';
    let errorDetails = error.message || String(error);

    if (error.message?.includes('Configuración de PayPal incompleta') || error.message?.includes('CRITICAL_SERVER_ERROR') || error.message?.includes('Supabase URL') || error.message?.includes('Supabase Service Role Key')) {
      errorMessage = error.message; // Propagate critical config errors
    } else if (error.message?.includes('UNPROCESSABLE_ENTITY') || (error.data && (error.data as any).details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED')) {
      errorMessage = 'Esta orden de PayPal ya ha sido capturada previamente.';
      // Consider what orderID to return if request.json() failed
      const body = await request.json().catch(() => ({ orderID: 'unknown' }));
      return NextResponse.json({ message: errorMessage, orderID: body.orderID  }, { status: 200 }); // Return 200 as it's not a new server error
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
    } else if (error.message && error.message.includes('json')) { // Catch JSON parsing errors for the request body
        errorMessage = `Error al parsear el cuerpo de la solicitud: ${error.message}`;
        errorDetails = "Asegúrese de que el cuerpo de la solicitud sea un JSON válido.";
        return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: 400 });
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: errorDetails,
    }, { status: