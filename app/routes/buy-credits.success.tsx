import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/", { headers });
    }

    // Set a flash message for the dashboard
    headers.append("Set-Cookie", `flash=${encodeURIComponent("Purchase successful! Thank you for buying credits.")}; Path=/`);

    // Redirect to the dashboard
    return redirect("/dashboard", { headers });
};

// No need for a default export as we're always redirecting