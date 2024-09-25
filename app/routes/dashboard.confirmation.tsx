import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export default function Confirmation() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/dashboard");
        }, 5000);  // Redirect to dashboard after 5 seconds

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your purchase. Your credits have been added to your account.</p>
            <p>You will be redirected to the dashboard in 5 seconds...</p>
            <button onClick={() => navigate("/dashboard")}>Go to Dashboard Now</button>
        </div>
    );
}