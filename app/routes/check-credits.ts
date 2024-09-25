import { json, LoaderFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2024-06-20",
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
        return json({ error: "Missing session ID" }, { status: 400 });
    }

    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    // Fetch the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Fetch the user's profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("credits, stripe_customer_id")
        .eq("id", user.id)
        .single();

    // Check if the webhook has processed this payment
    const { data: paymentProcessed } = await supabase
        .from("processed_payments")
        .select("processed")
        .eq("session_id", sessionId)
        .single();

    console.log("Check credits data:", {
        credits: profile?.credits || 0,
        paymentStatus: session.payment_status,
        paymentIntent: session.payment_intent,
        webhookProcessed: paymentProcessed?.processed || false,
        stripeCustomerId: profile?.stripe_customer_id,
    });

    return json({
        webhookProcessed: paymentProcessed?.processed || false,
    }, { headers });
};