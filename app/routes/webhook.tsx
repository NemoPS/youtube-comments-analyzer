import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import Stripe from "stripe";
import { sb } from "~/api/sb";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const action: ActionFunction = async ({ request }) => {
    const payload = await request.text();
    const sig = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 400 });
    }

    console.log("Received event type:", event.type);

    if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const credits = parseInt(checkoutSession.metadata?.credits || "0", 10);
        const userId = checkoutSession.client_reference_id;

        if (!userId) {
            console.error("User ID not found in session");
            return json({ error: "User ID not found" }, { status: 400 });
        }

        const supabase = sb(request, new Headers());

        // Add credits to user's account
        const { error } = await supabase.rpc('add_credits', {
            user_id: userId,
            amount: credits
        });

        if (error) {
            console.error("Error adding credits:", error);
            return json({ error: "Error adding credits" }, { status: 500 });
        }

        // Mark the payment as processed in the database and record the amount of credits
        const { error: processedError } = await supabase
            .from('processed_payments')
            .insert({
                session_id: checkoutSession.id,
                processed: true,
                credits_purchased: credits,
                user_id: userId,
                amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : null // Convert cents to dollars
            });

        if (processedError) {
            console.error("Error marking payment as processed:", processedError);
            return json({ error: "Failed to mark payment as processed" }, { status: 500 });
        }

        console.log("Payment processed successfully");
        return json({ success: true });
    } else if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.created' || event.type === 'charge.updated') {
        // console.log(`Received ${event.type} event, no action needed.`);
    } else {
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
};