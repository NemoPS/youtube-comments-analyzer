import { useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import { useEffect } from "react";
import { loadComments } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";

type LoaderData = {
    flashMessage: string | null;
    user: any; // Replace with your actual user type
    previousSearches: Array<{ url: string; painPoints: string[] }>;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/", { headers });
    }

    // Get the flash message from the cookie
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = cookieHeader.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {} as Record<string, string>);

    const flashMessage = cookies.flash || null;

    // Clear the flash message
    if (flashMessage) {
        headers.append("Set-Cookie", "flash=; Max-Age=0; Path=/");
    }

    // Dummy data for previous searches
    const previousSearches = [
        { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", painPoints: ["Rickrolling", "Overplayed", "Predictable"] },
        { url: "https://www.youtube.com/watch?v=jNQXAC9IVRw", painPoints: ["Short duration", "Low quality", "Lack of content"] },
    ];

    return json({ flashMessage, user, previousSearches }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const youtubeUrl = formData.get("youtubeUrl") as string;

    const comments = await loadComments(youtubeUrl);
    const { gpt, error } = await getFromGPT(comments.join("\n"));

    if (error) {
        return json({ error: "Failed to analyze comments" }, { status: 500 });
    }

    return json({ painPoints: gpt });
};

export default function Dashboard() {
    const { flashMessage, user, previousSearches } = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.data && fetcher.data.painPoints) {
            console.log("Pain points:", fetcher.data.painPoints);
        }
    }, [fetcher.data]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {flashMessage && navigation.state === "idle" && (
                <div className="alert alert-success mb-4">
                    <span>{flashMessage}</span>
                </div>
            )}

            <p className="mb-4">Welcome, {user.email}</p>

            <fetcher.Form method="post" className="mb-8">
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="youtubeUrl"
                        placeholder="Enter YouTube URL"
                        className="input input-bordered flex-grow"
                        required
                    />
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </div>
            </fetcher.Form>

            {fetcher.data && fetcher.data.painPoints && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Pain Points</h2>
                    <ul className="list-disc pl-5">
                        {fetcher.data.painPoints.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
            )}

            {fetcher.state === "submitting" && (
                <div className="mb-8">
                    <p>Analyzing comments...</p>
                </div>
            )}

            {fetcher.data && fetcher.data.error && (
                <div className="alert alert-error mb-8">
                    <span>{fetcher.data.error}</span>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold mb-4">Previous Searches</h2>
                <ul className="space-y-4">
                    {previousSearches.map((search, index) => (
                        <li key={index} className="bg-base-200 p-4 rounded-lg">
                            <p className="font-semibold">{search.url}</p>
                            <ul className="list-disc pl-5 mt-2">
                                {search.painPoints.map((point, pointIndex) => (
                                    <li key={pointIndex}>{point}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}