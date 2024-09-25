import { json, LoaderFunctionArgs } from "@remix-run/node";
import Stripe from "stripe";
import { sb } from "~/api/sb";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2024-06-20",
});

export const action = async ({ request }: LoaderFunctionArgs) => {
    const { productId } = await request.json();
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    const product = await stripe.products.retrieve(productId);
    const price = await stripe.prices.retrieve(product.default_price as string);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${request.headers.get("origin")}/pending-credits?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get("origin")}/buy-credits?canceled=true`,
        client_reference_id: user.id,
        metadata: {
            credits: product.metadata.credits || "0",
        },
    });

    return json({ id: session.id });
};