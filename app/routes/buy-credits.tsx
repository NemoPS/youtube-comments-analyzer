import { useState } from "react";
import { useLoaderData, useNavigation } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { sb } from "~/api/sb";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

type User = {
    id: string;
    email: string;
};

type Profile = {
    id: string;
    credits: number;
};

type Product = {
    id: string;
    name: string;
    price: number;
};

type LoaderData = {
    user: User | null;
    profile: Profile | null;
    stripePublishableKey: string;
    products: Product[];
};

// Move this outside the loader to avoid recreating on every request
const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2024-06-20",
});

// Cache the products for 1 hour
let cachedProducts: Product[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

async function getProducts() {
    const currentTime = Date.now();
    if (cachedProducts && currentTime - lastFetchTime < CACHE_DURATION) {
        return cachedProducts;
    }

    const { data: products } = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
    });

    cachedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: (product.default_price as Stripe.Price).unit_amount! / 100,
    }));

    lastFetchTime = currentTime;
    return cachedProducts;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirect to home page if user is not logged in
        return redirect("/", { headers });
    }

    // Combine user and profile fetch into a single query
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch products (now cached)
    const products = await getProducts();

    return json({
        user,
        profile,
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE,
        products,
    }, { headers });
};

export default function BuyCredits() {
    const { profile, stripePublishableKey, products } = useLoaderData<LoaderData>();
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const handlePurchase = async () => {
        if (!selectedProductId) return;
        setIsLoading(true);

        try {
            const response = await fetch("/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId: selectedProductId }),
            });

            const { id } = await response.json();
            const stripe = await loadStripe(stripePublishableKey);
            const result = await stripe?.redirectToCheckout({ sessionId: id });

            if (result?.error) {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Purchase error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isProcessing = isLoading || navigation.state === "submitting";

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Buy Credits</h1>
            <div className="bg-base-200 rounded-lg p-6">
                <p className="mb-4">Current Credits: {profile?.credits || 0}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            className={`btn btn-outline ${selectedProductId === product.id ? "btn-primary" : ""}`}
                            onClick={() => setSelectedProductId(product.id)}
                            disabled={isProcessing}
                        >
                            {product.name} - ${product.price}
                        </button>
                    ))}
                </div>
                <button
                    className="btn btn-primary w-full"
                    onClick={handlePurchase}
                    disabled={!selectedProductId || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <span className="loading loading-spinner"></span>
                            Processing...
                        </>
                    ) : (
                        "Purchase Selected Product"
                    )}
                </button>
            </div>
        </div>
    );
}