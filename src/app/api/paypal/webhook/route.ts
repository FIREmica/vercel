// /src/app/api/paypal/webhook/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk'; // Ensure this SDK is appropriate for webhook verification or use direct API calls
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client FOR DATABASE OPERATIONS
// Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("CRITICAL ERROR (PayPal Webhook): Supabase URL or Service Role Key not configured. Webhook cannot update database.");
  // This is a server configuration error. The webhook will likely fail to process meaningfully.
}
const supabaseAdminClient = createClient(supabaseUrl!, serviceRoleKey!);


// Helper function to configure PayPal client (ensure this matches your other PayPal API routes)
// This might be different for webhook verification depending on PayPal's SDK/API.
// For webhook verification, you often use your Client ID, Secret, and Webhook ID.
function getPayPalEnvironment() {
  const clientId = process.env.NODE_ENV === 'production'
    ? process.env.PAYPAL_LIVE_CLIENT_ID // You'll need to set these for production
    : process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.NODE_ENV === 'production'
    ? process.env.PAYPAL_LIVE_CLIENT_SECRET // You'll need to set these for production
    : process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.PAYPAL_LIVE_API_BASE_URL || 'https://api-m.paypal.com'
    : process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('CRITICAL ERROR (PayPal Webhook): PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured for environment.');
    throw new Error('PayPal Client configuration incomplete for webhook.');
  }

  return baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
}

export async function POST(request: Request) {
  console.log('PayPal Webhook: POST request received.');
  let eventData;

  try {
    const rawBody = await request.text();
    eventData = JSON.parse(rawBody); // PayPal sends JSON
    console.log('PayPal Webhook: Event body parsed:', JSON.stringify(eventData, null, 2));

    // -------------------------------------------------------------------------
    // STEP 1: VERIFY WEBHOOK SIGNATURE (CRITICAL FOR SECURITY!)
    // -------------------------------------------------------------------------
    // This is a conceptual placeholder. Actual implementation is complex and
    // requires using PayPal's SDK or specific API calls with headers from the request.
    // You need:
    // 1. Your Webhook ID from PayPal Developer Portal (set as an env variable, e.g., PAYPAL_WEBHOOK_ID).
    // 2. Headers from the incoming request:
    //    - 'paypal-auth-algo'
    //    - 'paypal-cert-url'
    //    - 'paypal-transmission-id'
    //    - 'paypal-transmission-sig'
    //    - 'paypal-transmission-time'
    // 3. The raw request body (eventData).
    //
    // Example using a conceptual SDK function (this function doesn't exist in this exact form):
    // const paypalClient = new paypal.core.PayPalHttpClient(getPayPalEnvironment());
    // const verificationRequest = new paypal.webhooks.WebhooksVerifySignatureRequest(); // Fictional
    // verificationRequest.webhookId = process.env.PAYPAL_WEBHOOK_ID;
    // verificationRequest.authAlgo = request.headers.get('paypal-auth-algo');
    // ... add other headers and the event body ...
    // const verificationResponse = await paypalClient.execute(verificationRequest);
    // if (verificationResponse.result.verification_status !== 'SUCCESS') {
    //   console.error('PayPal Webhook: SIGNATURE VERIFICATION FAILED:', verificationResponse.result);
    //   return NextResponse.json({ error: 'Webhook signature verification failed. Unauthorized.' }, { status: 401 });
    // }
    // console.log('PayPal Webhook: Signature verified successfully (CONCEPTUAL).');
    //
    // FOR DEVELOPMENT/TESTING ONLY - REMOVE THIS IN PRODUCTION IF SIGNATURE VERIFICATION IS NOT IMPLEMENTED
    const isSignatureVerified = true; // !! IMPORTANT: REPLACE WITH ACTUAL VERIFICATION !!
    if (!isSignatureVerified) {
        console.error('PayPal Webhook: SIGNATURE VERIFICATION FAILED (Actual implementation needed).');
        return NextResponse.json({ error: 'Webhook signature verification failed. Unauthorized.' }, { status: 401 });
    }
    console.warn("PayPal Webhook: SIGNATURE VERIFICATION IS CURRENTLY A PLACEHOLDER. DO NOT USE IN PRODUCTION WITHOUT ACTUAL IMPLEMENTATION!");


    // -------------------------------------------------------------------------
    // STEP 2: PROCESS THE EVENT
    // -------------------------------------------------------------------------
    const eventType = eventData.event_type;
    const resource = eventData.resource;

    console.log(`PayPal Webhook: Event Type: ${eventType}, Resource ID: ${resource?.id}`);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = resource.id; // ID of the PayPal order (capture ID in this case)
      // To link this back to a user, you need a common identifier.
      // If you stored your internal order ID or user ID in `purchase_units[0].custom_id` or `invoice_id`
      // when creating the order, you would extract it here.
      // For example: const internalOrderId = resource.purchase_units?.[0]?.invoice_id;
      // Then, you'd look up the userId associated with that internalOrderId.

      // ** SIMPLIFIED LOGIC FOR DEMO: Assume orderId might be what we stored in `paypal_order_id` **
      // In a real system, you'd need a more robust way to map PayPal's order/capture ID back to your user.
      // One way is to query `user_profiles` for a matching `paypal_order_id` if you updated it
      // during the `/api/paypal/capture-order` flow.

      if (!orderId) {
          console.error(`PayPal Webhook (PAYMENT.CAPTURE.COMPLETED): Order ID missing in resource.`);
          return NextResponse.json({ received: true, error: "Order ID missing in webhook resource." });
      }
      
      console.log(`PayPal Webhook: Processing PAYMENT.CAPTURE.COMPLETED for Order/Capture ID: ${orderId}`);

      // Find user by the PayPal Order ID that should have been stored during the capture flow
      const { data: userProfileData, error: profileError } = await supabaseAdminClient
        .from('user_profiles')
        .select('id, subscription_status')
        .eq('paypal_order_id', orderId) // Match against the order ID
        .single(); // Expect one user for this order ID

      if (profileError || !userProfileData) {
        console.error(`PayPal Webhook: Error fetching user profile for paypal_order_id ${orderId} or profile not found:`, profileError?.message);
        // Respond 200 to PayPal, but log for investigation.
        return NextResponse.json({ received: true, error: `User profile not found for PayPal order ID ${orderId} or DB error.` });
      }
      
      const userId = userProfileData.id;
      console.log(`PayPal Webhook: User profile found for PayPal order ID ${orderId}. User ID: ${userId}`);

      // Update the database if not already premium or if subscription needs extension
      if (userProfileData.subscription_status !== 'active_premium') {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const { data: updateData, error: dbError } = await supabaseAdminClient
          .from('user_profiles')
          .update({
            subscription_status: 'active_premium',
            current_period_end: thirtyDaysFromNow.toISOString(),
            // paypal_customer_id: resource.payer?.payer_id, // If you need Payer ID
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select();

        if (dbError) {
          console.error(`PayPal Webhook: Error updating DB for order ${orderId}, user ${userId}:`, dbError.message);
          // Still return 200 to PayPal to prevent retries for this event, but log this critical error.
          return NextResponse.json({ received: true, error_db_update: dbError.message });
        }
        console.log(`PayPal Webhook: Subscription updated in DB for order ${orderId}, user ${userId}. New status: active_premium.`);
      } else {
        console.log(`PayPal Webhook: User ${userId} already has active_premium status. No DB update needed for this event.`);
      }

    } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        // This event occurs BEFORE the capture. Usually, you act on PAYMENT.CAPTURE.COMPLETED.
        console.log(`PayPal Webhook: Received CHECKOUT.ORDER.APPROVED for Order ID: ${resource.id}. Typically, action is taken on PAYMENT.CAPTURE.COMPLETED.`);
    
    } else if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        // If you implement PayPal Subscriptions (recurring payments)
        // const subscriptionId = resource.id;
        // const userId = resource.custom_id; // If you set custom_id on the subscription plan
        // TODO: Logic to update user status, set subscription period.
        console.log(`PayPal Webhook: TODO - Implement logic for BILLING.SUBSCRIPTION.ACTIVATED. ID: ${resource.id}`);
    
    } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
        // If you implement PayPal Subscriptions
        // const subscriptionId = resource.id;
        // TODO: Logic to update user status to cancelled, adjust current_period_end if applicable.
        console.log(`PayPal Webhook: TODO - Implement logic for BILLING.SUBSCRIPTION.CANCELLED. ID: ${resource.id}`);
    
    } else {
      console.log(`PayPal Webhook: Event type "${eventType}" not explicitly handled or not relevant for immediate subscription activation.`);
    }

    // Always respond to PayPal with a 200 OK to acknowledge receipt.
    // This prevents PayPal from retrying the webhook.
    return NextResponse.json({ received: true, message: "Webhook event processed." });

  } catch (error: any) {
    console.error('PayPal Webhook: Critical error in webhook handler:', error.message);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON payload received from PayPal.' }, { status: 400 });
    }
    // For other errors, respond 500 so PayPal might retry if it's a transient issue.
    return NextResponse.json({ error: 'Internal server error processing webhook.' }, { status: 500 });
  }
}
