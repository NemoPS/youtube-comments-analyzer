import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sb } from "~/api/sb";
import { useState } from "react";

type Purchase = {
    id: string;
    created_at: string;
    credits_purchased: number;
    amount: number;
    status: string;
    session_id: string; // Add this line
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
        .select('id, created_at, credits_purchased, amount, status, session_id') // Add session_id
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
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(text);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'text-success';
            case 'refunded':
                return 'text-error';
            default:
                return 'text-base-content';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Purchase History</h1>
            {purchases.length === 0 ? (
                <p>You haven't made any purchases yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="hidden md:table-header-group">
                            <tr>
                                <th className="p-2 text-left">Date</th>
                                <th className="p-2 text-left">Credits</th>
                                <th className="p-2 text-left">Amount</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-center">Session ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id} className="border-b flex flex-col md:table-row">
                                    <td className="p-2 flex justify-between md:table-cell">
                                        <span className="font-bold md:hidden">Date:</span>
                                        <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                                    </td>
                                    <td className="p-2 flex justify-between md:table-cell">
                                        <span className="font-bold md:hidden">Credits:</span>
                                        <span>{purchase.credits_purchased}</span>
                                    </td>
                                    <td className="p-2 flex justify-between md:table-cell">
                                        <span className="font-bold md:hidden">Amount:</span>
                                        <span>${purchase.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="p-2 flex justify-between md:table-cell">
                                        <span className="font-bold md:hidden">Status:</span>
                                        <span className={getStatusColor(purchase.status)}>{purchase.status}</span>
                                    </td>
                                    <td className="p-2 flex justify-between md:table-cell md:text-center">
                                        <span className="font-bold md:hidden">Session ID:</span>
                                        <button
                                            onClick={() => copyToClipboard(purchase.session_id)}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="Copy Session ID"
                                        >
                                            {copiedId === purchase.session_id ? (
                                                <CheckIcon className="h-5 w-5" />
                                            ) : (
                                                <ClipboardIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
    );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    );
}