import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sb } from "~/api/sb";

type Purchase = {
    id: string;
    created_at: string;
    credits_purchased: number;
    amount: number;
    status: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    const { data: purchases, error } = await supabase
        .from('processed_payments')
        .select('id, created_at, credits_purchased, amount, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching purchases:", error);
        return json({ error: "Failed to fetch purchases" }, { status: 500 });
    }

    return json({ purchases });
};

export default function Purchases() {
    const { purchases } = useLoaderData<{ purchases: Purchase[] }>();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Purchase History</h1>
            {purchases.length === 0 ? (
                <p>You haven't made any purchases yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Credits Purchased</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td>{new Date(purchase.created_at).toLocaleDateString()}</td>
                                    <td>{purchase.credits_purchased}</td>
                                    <td>${purchase.amount.toFixed(2)}</td>
                                    <td>{purchase.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}