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
        return redirect("/", { headers });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Use cached products or fetch if cache is expired
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
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const navigation = useNavigation();

    const handlePurchase = async (productId: string) => {
        setIsProcessing(productId);

        try {
            const response = await fetch("/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            });

            const { id } = await response.json();
            const stripe = await loadStripe(stripePublishableKey);
            await stripe?.redirectToCheckout({ sessionId: id });
        } catch (error) {
            console.error("Purchase error:", error);
        } finally {
            setIsProcessing(null);
        }
    };

    // Sort products by credits (assuming the credits are stored in the product name)
    const sortedProducts = [...products].sort((a, b) => {
        const creditsA = parseInt(a.name.split(' ')[0]);
        const creditsB = parseInt(b.name.split(' ')[0]);
        return creditsA - creditsB;
    });

    const descriptions = [
        "Perfect for casual users. Ideal for those just starting out or with occasional analysis needs. Get a taste of our powerful insights without a big commitment.",
        "Great for power users and small teams. Dive deeper into your content analysis with more credits. Unlock the full potential of our platform for regular use.",
        "Designed for pros and large teams with high-volume needs. Maximize your insights with our most comprehensive package and next-level your channel."
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-12 md:py-20 px-4 md:px-6">
            <div className="text-center space-y-4 mb-10">
                <h1 className="text-3xl md:text-4xl font-bold">Purchase Credits</h1>
                <p className="text-base-content/70 text-lg md:text-xl max-w-2xl mx-auto">
                    Unlock the full potential of our platform by purchasing credits. Choose from our flexible tiers to fit your unique needs.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product, index) => (
                    <div key={product.id} className="bg-base-200 p-6 rounded-lg shadow-sm flex flex-col items-center text-center gap-4">
                        {index === 0 && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-12 h-12 text-primary"
                            >
                                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                            </svg>
                        )}
                        {index === 1 && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-12 h-12 text-primary"
                            >
                                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
                                <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                                <path d="M16 11h0"></path>
                            </svg>
                        )}
                        {index === 2 && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-12 h-12 text-primary"
                            >
                                <path d="M6 3h12l4 6-10 13L2 9Z"></path>
                                <path d="M11 3 8 9l4 13 4-13-3-6"></path>
                                <path d="M2 9h20"></path>
                            </svg>
                        )}
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">{product.name}</h3>
                            <p className="text-base-content/70">
                                {descriptions[index]}
                            </p>
                        </div>
                        <button
                            className={`btn btn-primary w-full ${isProcessing === product.id ? "btn-disabled" : ""}`}
                            onClick={() => handlePurchase(product.id)}
                            disabled={isProcessing !== null}
                        >
                            {isProcessing === product.id ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                `Get it for $${product.price}`
                            )}
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <p className="mb-4">Current Credits: {profile?.credits || 0}</p>
            </div>
        </div>
    );
}