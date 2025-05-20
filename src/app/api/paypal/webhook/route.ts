// /src/app/api/paypal/webhook/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk'; // Ensure this SDK is appropriate for webhook verification or use direct API calls
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client FOR DATABASE OPERATIONS
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Supabase URL o Service Role Key no están configuradas para el webhook de PayPal.");
  // Depending on your error handling strategy, you might throw or handle differently
}
const supabaseAdminClient = createClient(supabaseUrl!, serviceRoleKey!);


// Helper function to configure PayPal client (ensure this matches your other PayPal API routes)
// This might be different for webhook verification depending on PayPal's SDK/API.
// For webhook verification, you often use your Client ID, Secret, and Webhook ID.
function getPayPalEnvironment() {
  const clientId = process.env.NODE_ENV === 'production'
    ? process.env.PAYPAL_LIVE_CLIENT_ID
    : process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.NODE_ENV === 'production'
    ? process.env.PAYPAL_LIVE_CLIENT_SECRET
    : process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.PAYPAL_LIVE_API_BASE_URL || 'https://api-m.paypal.com'
    : process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('Error en PayPal Client (Webhook): PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no configurados.');
    throw new Error('Configuración de PayPal incompleta en el servidor para webhook.');
  }

  return baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
}

export async function POST(request: Request) {
  console.log('PayPal Webhook: Solicitud POST recibida.');
  let eventData;

  try {
    const rawBody = await request.text();
    eventData = JSON.parse(rawBody); // PayPal sends JSON
    console.log('PayPal Webhook: Cuerpo del evento parseado:', JSON.stringify(eventData, null, 2));

    // -------------------------------------------------------------------------
    // PASO 1: VERIFICAR LA AUTENTICIDAD DEL WEBHOOK (¡MUY IMPORTANTE!)
    // -------------------------------------------------------------------------
    // Necesitas verificar que esta solicitud proviene realmente de PayPal.
    // Esto implica obtener tu `PAYPAL_WEBHOOK_ID` de tu aplicación en PayPal Developer Portal
    // y usar la API de PayPal para verificar la firma.
    //
    // Referencia: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
    //
    // const paypalClient = new paypal.core.PayPalHttpClient(getPayPalEnvironment());
    // const verifyRequest = new paypal.webhooks.WebhooksVerifySignatureRequest(); // Check SDK for actual class
    // verifyRequest.requestBody({
    //   auth_algo: request.headers.get('paypal-auth-algo'),
    //   cert_url: request.headers.get('paypal-cert-url'),
    //   transmission_id: request.headers.get('paypal-transmission-id'),
    //   transmission_sig: request.headers.get('paypal-transmission-sig'),
    //   transmission_time: request.headers.get('paypal-transmission-time'),
    //   webhook_id: process.env.PAYPAL_WEBHOOK_ID, // Debes configurar esta variable de entorno
    //   webhook_event: eventData // El objeto JSON parseado del evento
    // });
    //
    // try {
    //   const verifyResponse = await paypalClient.execute(verifyRequest);
    //   if (verifyResponse.result.verification_status !== 'SUCCESS') {
    //     console.error('PayPal Webhook: Verificación de firma FALLIDA:', verifyResponse.result);
    //     return NextResponse.json({ error: 'Verificación de webhook fallida. Solicitud no autorizada.' }, { status: 401 });
    //   }
    //   console.log('PayPal Webhook: Firma verificada exitosamente.');
    // } catch (verificationError: any) {
    //   console.error('PayPal Webhook: Error durante la verificación de la firma:', verificationError.message);
    //   return NextResponse.json({ error: 'Error interno durante la verificación del webhook.' }, { status: 500 });
    // }
    // ---- FIN DE LA VERIFICACIÓN CONCEPTUAL ----
    // POR AHORA, ASUMIMOS QUE ES VÁLIDO PARA PROPÓSITOS DE DESARROLLO.
    // ¡NO USAR EN PRODUCCIÓN SIN VERIFICACIÓN REAL!
    console.warn("PayPal Webhook: LA VERIFICACIÓN DE FIRMA ESTÁ DESHABILITADA. ¡NO USAR EN PRODUCCIÓN!");


    // -------------------------------------------------------------------------
    // PASO 2: PROCESAR EL EVENTO
    // -------------------------------------------------------------------------
    const eventType = eventData.event_type;
    const resource = eventData.resource;

    console.log(`PayPal Webhook: Tipo de Evento: ${eventType}, ID del Recurso: ${resource?.id}`);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = resource.id; // ID de la orden de PayPal
      // Supongamos que durante la creación de la orden, guardaste tu `userId` interno en `custom_id`
      // o en `purchase_units[0].custom_id` o `purchase_units[0].invoice_id`.
      // Necesitas una forma de mapear esta orden de PayPal de vuelta a un usuario en tu sistema.
      // const userId = resource.purchase_units?.[0]?.custom_id; // EJEMPLO - ajusta según cómo creaste la orden

      // Simulación de obtención de userId (deberías obtenerlo del evento o de una búsqueda basada en orderId)
      const userIdAssociatedWithOrder = resource.purchase_units?.[0]?.custom_id || resource.purchase_units?.[0]?.invoice_id; // Placeholder

      if (!userIdAssociatedWithOrder) {
        console.error(`PayPal Webhook (PAYMENT.CAPTURE.COMPLETED): No se pudo determinar el userId para la orden ${orderId}. El campo 'custom_id' o 'invoice_id' podría estar faltando en la orden de PayPal.`);
        // Devuelve 200 para que PayPal no reintente, pero registra el error para investigación.
        return NextResponse.json({ received: true, error: "No se pudo determinar el usuario para la orden." });
      }
      
      console.log(`PayPal Webhook: Procesando PAYMENT.CAPTURE.COMPLETED para Orden ID: ${orderId}, UserID (conceptual): ${userIdAssociatedWithOrder}`);

      // Actualizar la base de datos
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const { data: updateData, error: dbError } = await supabaseAdminClient
        .from('user_profiles')
        .update({
          subscription_status: 'active_premium',
          current_period_end: thirtyDaysFromNow.toISOString(),
          paypal_order_id: orderId,
          // paypal_customer_id: resource.payer?.payer_id, // Si almacenas el ID del pagador de PayPal
          updated_at: new Date().toISOString(),
        })
        .eq('id', userIdAssociatedWithOrder) // Asegúrate de que esta columna 'id' en user_profiles es el auth.users.id
        .select();

      if (dbError) {
        console.error(`PayPal Webhook: Error al actualizar DB para orden ${orderId}, usuario ${userIdAssociatedWithOrder}:`, dbError.message);
        // Aún devuelve 200 para que PayPal no reintente, pero este error debe ser manejado (ej. reintentos internos, alerta a admin).
        return NextResponse.json({ received: true, error_db: dbError.message });
      }

      console.log(`PayPal Webhook: Suscripción actualizada en DB para orden ${orderId}, usuario ${userIdAssociatedWithOrder}.`);

    } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        // Este evento ocurre ANTES de la captura. Generalmente, querrás actuar sobre PAYMENT.CAPTURE.COMPLETED.
        console.log(`PayPal Webhook: CHECKOUT.ORDER.APPROVED para Orden ID: ${resource.id}. Generalmente se espera PAYMENT.CAPTURE.COMPLETED.`);
    
    } else if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        // const subscriptionId = resource.id;
        // const userId = resource.custom_id; // Si configuraste custom_id en la suscripción
        // TODO: Actualizar el estado del usuario a activo, establecer fechas de ciclo.
        console.log(`PayPal Webhook: TODO - Procesar BILLING.SUBSCRIPTION.ACTIVATED para ID: ${resource.id}`);
    
    } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
        // const subscriptionId = resource.id;
        // const userId = resource.custom_id;
        // TODO: Actualizar el estado del usuario a cancelado, ajustar current_period_end.
        console.log(`PayPal Webhook: TODO - Procesar BILLING.SUBSCRIPTION.CANCELLED para ID: ${resource.id}`);
    
    } else {
      console.log(`PayPal Webhook: Evento no manejado o no relevante directamente para la activación: ${eventType}`);
    }

    // Siempre responde a PayPal con un 200 OK para acusar recibo.
    return NextResponse.json({ received: true, message: "Evento de Webhook procesado." });

  } catch (error: any) {
    console.error('PayPal Webhook: Error crítico en el manejador:', error.message);
    // En caso de un error al parsear o un error inesperado, devuelve 500 para que PayPal pueda reintentar si es apropiado.
    // O 400 si el error es claramente del cliente (ej. malformed JSON que no es de PayPal).
    return NextResponse.json({ error: 'Error interno del servidor al procesar el webhook.' }, { status: 500 });
  }
}
