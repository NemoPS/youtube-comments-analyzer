import { useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import { useEffect } from "react";
import { loadComments } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";

type User = {
    id: string;
    email: string;
    // Add other user properties as needed
};

type LoaderData = {
    flashMessage: string | null;
    user: User;
    previousSearches: Array<{
        video_url: string;
        video_title: string;
        thumbnail_url: string | null;
        pain_points: string[];
    }>;
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

    // Fetch real previous searches from the database
    const { data: previousSearches, error } = await supabase
        .from('youtube_searches')
        .select('video_url, video_title, thumbnail_url, pain_points')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching previous searches:", error);
    }

    return json({ flashMessage, user, previousSearches: previousSearches || [] }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const youtubeUrl = formData.get("youtubeUrl") as string;

    // Uncomment the following line to use dummy data instead of real API calls
    return json({ painPoints: getDummyPainPoints() });

    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const { title, comments } = await loadComments(youtubeUrl);
        const { gpt, error } = await getFromGPT(comments.join("\n"));

        if (error) {
            return json({ error: "Failed to analyze comments" }, { status: 500 });
        }

        // Save the search data to the youtube_searches table
        const { error: videoError } = await supabase
            .from('youtube_searches')
            .insert({
                user_id: user.id,
                video_url: youtubeUrl,
                video_title: title,
                thumbnail_url: null, // You might want to fetch this from the YouTube API
                pain_points: gpt
            });

        if (videoError) {
            console.error("Error saving search data:", videoError);
            return json({ error: "Failed to save search data" }, { status: 500 });
        }

        return json({ painPoints: gpt });
    } catch (error) {
        console.error("Error processing YouTube data:", error);
        return json({ error: "Failed to process YouTube data" }, { status: 500 });
    }
};

export default function Dashboard() {
    const { flashMessage, user, previousSearches } = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const fetcher = useFetcher<{ painPoints?: string[]; error?: string }>();

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
                        {fetcher.data.painPoints.map((point, index) => (
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
                            <div className="flex items-center mb-2">
                                {search.thumbnail_url && (
                                    <img src={search.thumbnail_url} alt="Video thumbnail" className="w-24 h-auto mr-4" />
                                )}
                                <div>
                                    <p className="font-semibold">{search.video_title}</p>
                                    <a href={search.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {search.video_url}
                                    </a>
                                </div>
                            </div>
                            <ul className="list-disc pl-5 mt-2">
                                {search.pain_points.map((point, pointIndex) => (
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

function getDummyPainPoints() {
    return [
        "Difficulty understanding complex topics",
        "Lack of practical examples in the video",
        "Audio quality issues in some sections",
        "Too much information presented too quickly",
        "Insufficient explanation of prerequisite knowledge"
    ];
}