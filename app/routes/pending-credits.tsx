import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";

type LoaderData = {
    initialCredits: number;
    sessionId: string;
};

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

    const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

    return json({
        initialCredits: profile?.credits || 0,
        sessionId,
    }, { headers });
};

export default function PendingCredits() {
    const { initialCredits, sessionId } = useLoaderData<LoaderData>();
    const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);
    const navigate = useNavigate();

    const checkPayment = useCallback(async () => {
        try {
            const response = await fetch(`/check-credits?session_id=${sessionId}`);
            if (!response.ok) {
                throw new Error('Failed to check payment status');
            }
            const data = await response.json();
            console.log("Check payment response:", data);

            if (data.webhookProcessed) {
                setStatus("success");
            } else {
                setAttempts((prev) => prev + 1);
            }
        } catch (error) {
            console.error('Error checking payment:', error);
            setStatus("error");
            setErrorMessage("An error occurred while checking the payment status.");
        }
    }, [sessionId]);

    useEffect(() => {
        if (status === "pending" && attempts < 5) {
            const timer = setTimeout(() => {
                checkPayment();
            }, 2000);

            return () => clearTimeout(timer);
        } else if (attempts >= 5 && status !== "success") {
            setStatus("error");
            setErrorMessage("Payment processing timed out. The webhook may have failed. Please contact support.");
        }
    }, [status, attempts, checkPayment]);

    useEffect(() => {
        if (status === "success") {
            navigate("/dashboard/confirmation");
        }
    }, [status, navigate]);

    if (status === "pending") {
        return <div>Processing your payment... This may take a few moments.</div>;
    } else if (status === "success") {
        return <div>Payment successful! Redirecting to confirmation page...</div>;
    } else {
        return (
            <div>
                <p>There was an error processing your payment.</p>
                {errorMessage && <p>{errorMessage}</p>}
                <p>Please contact support at support@tubevoice.com for assistance.</p>
                <p>Include the following session ID in your message: {sessionId}</p>
                <button onClick={() => navigate("/dashboard")}>Return to Dashboard</button>
            </div>
        );
    }
}