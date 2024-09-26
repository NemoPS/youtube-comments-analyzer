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

    const supabase = sb(request, new Headers());

    if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const credits = parseInt(checkoutSession.metadata?.credits || "0", 10);
        const userId = checkoutSession.client_reference_id;

        if (!userId) {
            console.error("User ID not found in session");
            return json({ error: "User ID not found" }, { status: 400 });
        }

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
                amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : null,
                status: 'completed'
            });

        if (processedError) {
            console.error("Error marking payment as processed:", processedError);
            return json({ error: "Failed to mark payment as processed" }, { status: 500 });
        }

        console.log("Payment processed successfully");
        return json({ success: true });
    } else if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        console.log("Processing refund for payment_intent:", paymentIntentId);

        // Fetch the session using the payment intent
        const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntentId,
        });

        if (sessions.data.length === 0) {
            console.error("No session found for payment_intent:", paymentIntentId);
            return json({ error: "No session found for this payment" }, { status: 404 });
        }

        const session = sessions.data[0];

        // Find the corresponding purchase in your database using session_id
        const { data: purchase, error: purchaseError } = await supabase
            .from('processed_payments')
            .select('*')
            .eq('session_id', session.id)
            .single();

        if (purchaseError || !purchase) {
            console.error("Error finding purchase:", purchaseError);
            return json({ error: "Purchase not found", details: purchaseError }, { status: 404 });
        }

        console.log("Found purchase:", purchase);

        // Update the purchase status in the database
        const { error: updateError } = await supabase
            .from('processed_payments')
            .update({ status: 'refunded' })
            .eq('id', purchase.id);

        if (updateError) {
            console.error("Error updating purchase status:", updateError);
            return json({ error: "Failed to update purchase status", details: updateError }, { status: 500 });
        }

        console.log("Updated purchase status to refunded");

        // Log the current credits before deduction
        const { data: currentProfile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', purchase.user_id)
            .single();

        if (profileError) {
            console.error("Error fetching current profile:", profileError);
        } else {
            console.log("Current credits before deduction:", currentProfile.credits);
        }

        // Deduct credits using the RPC function
        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits', {
            user_id: purchase.user_id,
            amount: purchase.credits_purchased
        });

        if (deductError) {
            console.error("Error deducting credits:", deductError);
            return json({ error: "Failed to deduct credits", details: deductError }, { status: 500 });
        }

        console.log("Deduct credits RPC result:", deductResult);

        // Log the credits after deduction
        const { data: updatedProfile, error: updatedProfileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', purchase.user_id)
            .single();

        if (updatedProfileError) {
            console.error("Error fetching updated profile:", updatedProfileError);
        } else {
            console.log("Credits after deduction:", updatedProfile.credits);
        }

        console.log("Refund processed successfully");
        return json({ success: true });
    } else if (event.type === 'charge.refund.updated') {
        // Log the event, but no action needed
        console.log("Received charge.refund.updated event, no action needed");
    } else if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.created' || event.type === 'charge.updated') {
        console.log(`Received ${event.type} event, no action needed.`);
    } else {
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
};