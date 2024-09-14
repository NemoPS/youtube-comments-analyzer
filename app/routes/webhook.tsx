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

    // console.log("Received event type:", event.type);

    if (event.type === 'checkout.session.completed') {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        // console.log("Checkout session completed:", checkoutSession);

        const credits = parseInt(checkoutSession.metadata?.credits || "0", 10);
        const userId = checkoutSession.client_reference_id;

        // console.log("Credits to add:", credits);
        // console.log("User ID:", userId);

        if (!userId) {
            console.error("User ID not found in session");
            return json({ error: "User ID not found" }, { status: 400 });
        }

        const supabase = sb(request, new Headers());

        // console.log("Calling add_credits RPC function with:", { user_id: userId, amount: credits });
        const { data, error } = await supabase.rpc('add_credits', {
            user_id: userId,
            amount: credits
        });

        if (error) {
            console.error("Error adding credits:", error);
            return json({ error: "Error adding credits" }, { status: 500 });
        }

        // console.log("Credits added successfully. Result:", data);

        // Add this section to verify the credits were actually added
        const { data: updatedUser, error: fetchError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error("Error fetching updated user credits:", fetchError);
        } else {
            // console.log("Updated user credits:", updatedUser?.credits);
        }
    } else if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.created' || event.type === 'charge.updated') {
        // console.log(`Received ${event.type} event, no action needed.`);
    } else {
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
};