import { useState, useEffect } from "react";
import { useLoaderData, useNavigation, useFetcher, Outlet, useLocation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import { DummySearchCard } from "~/components/DummySearchCard";
import { PreviousSearchCard } from "~/components/PreviousSearchCard";
import { loadComments } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";
import { Spinner } from "~/components/Spinner";

type User = {
    id: string;
    email: string;
    // Add other user properties as needed
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

    return json({
        flashMessage,
        user,
    }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "delete") {
        const searchId = formData.get("searchId") as string;
        const headers = new Headers();
        const supabase = sb(request, headers);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return json({ error: "User not authenticated" }, { status: 401 });
        }

        const { error } = await supabase
            .from('youtube_searches')
            .delete()
            .eq('id', searchId)
            .eq('user_id', user.id);

        if (error) {
            console.error("Error deleting search:", error);
            return json({ error: "Failed to delete search" }, { status: 500 });
        }

        return json({ success: true });
    }

    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data } = await supabase.auth.getUser();
    const user = data.user as User | null;
    const youtubeUrl = formData.get("youtubeUrl") as string;

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        // Check if the video URL has already been searched
        const { data: existingSearch, error: searchError } = await supabase
            .from('youtube_searches')
            .select('id')
            .eq('user_id', user.id)
            .eq('video_url', youtubeUrl)
            .single();

        if (searchError && searchError.code !== 'PGRST116') {
            console.error("Error checking existing search:", searchError);
            return json({ error: "Failed to check existing search" }, { status: 500 });
        }

        if (existingSearch) {
            return json({ error: "This video has already been analyzed" }, { status: 400 });
        }

        // Fetch the user's current credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Error fetching user profile:", profileError);
            return json({ error: "Failed to fetch user profile" }, { status: 500 });
        }

        if (profile.credits < 1) {
            return json({ error: "Insufficient credits" }, { status: 400 });
        }

        const { title, comments, thumbnailUrl } = await loadComments(youtubeUrl);
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
                thumbnail_url: thumbnailUrl,
                pain_points: gpt.painPoints,
                discussed_topics: gpt.discussedTopics
            });

        if (videoError) {
            console.error("Error saving search data:", videoError);
            return json({ error: "Failed to save search data" }, { status: 500 });
        }

        // Deduct one credit from the user's profile
        const { error: updateError } = await supabase.rpc('deduct_credits', {
            user_id: user.id,
            amount: 1
        });

        if (updateError) {
            console.error("Error deducting credits:", updateError);
            return json({ error: "Failed to deduct credits" }, { status: 500 });
        }

        return json({
            painPoints: gpt.painPoints,
            discussedTopics: gpt.discussedTopics,
            videoTitle: title,
            videoUrl: youtubeUrl,
            thumbnailUrl
        });
    } catch (error) {
        console.error("Error processing YouTube data:", error);
        return json({ error: "Failed to process YouTube data" }, { status: 500 });
    }
};

export default function Dashboard() {
    const { flashMessage, user } = useLoaderData<typeof loader>();
    const location = useLocation();
    const isMainDashboard = location.pathname === "/dashboard";
    const previousSearchesFetcher = useFetcher<{
        previousSearches: {
            id: string;
            video_url: string;
            video_title: string;
            thumbnail_url: string | null;
            pain_points: Array<{ topic: string; description: string }>;
            discussed_topics: Array<{ topic: string; description: string }>;
        }[];
        totalPages: number;
        currentPage: number;
    }>();

    const [currentPage, setCurrentPage] = useState(1);
    const navigation = useNavigation();
    const fetcher = useFetcher<FetcherData>();

    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingPreviousSearches, setIsLoadingPreviousSearches] = useState(true);

    useEffect(() => {
        setIsLoadingPreviousSearches(true);
        previousSearchesFetcher.load(`/dashboard/previous-searches?page=${currentPage}`);
    }, [currentPage]);

    useEffect(() => {
        if (previousSearchesFetcher.state === 'idle') {
            setIsLoadingPreviousSearches(false);
        }
        // console.log('Previous searches data:', previousSearchesFetcher.data);
        // console.log('Previous searches state:', previousSearchesFetcher.state);
    }, [previousSearchesFetcher.data, previousSearchesFetcher.state]);

    useEffect(() => {
        if (fetcher.data && 'painPoints' in fetcher.data && fetcher.data.painPoints) {
            console.log("Pain points:", fetcher.data.painPoints);
        }
    }, [fetcher.data]);

    useEffect(() => {
        if (fetcher.state === "submitting") {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }
    }, [fetcher.state]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {isMainDashboard && (
                <>
                    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                    <p className="mb-4">Welcome, {user.email}</p>
                </>
            )}

            {flashMessage && navigation.state === "idle" && (
                <div className="alert alert-success mb-4">
                    <span>{flashMessage}</span>
                </div>
            )}

            {isMainDashboard ? (
                <>
                    <fetcher.Form method="post" className="mb-8">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="youtubeUrl"
                                placeholder="Enter YouTube URL"
                                className="input input-bordered flex-grow"
                                required
                            />
                            <button type="submit" className="btn btn-primary" disabled={isSearching}>
                                {isSearching ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                    </fetcher.Form>

                    {fetcher.data && 'error' in fetcher.data && fetcher.data.error && (
                        <div className="alert alert-error mb-8">
                            <span>{fetcher.data.error}</span>
                        </div>
                    )}

                    {isLoadingPreviousSearches ? (
                        <div className="flex justify-center items-center h-32">
                            <Spinner size="lg" />
                        </div>
                    ) : previousSearchesFetcher.data ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Previous Searches</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {isSearching && <DummySearchCard />}
                                {previousSearchesFetcher.data.previousSearches.map((search) => (
                                    <PreviousSearchCard
                                        key={search.id}
                                        search={search}
                                    />
                                ))}
                            </div>
                            {previousSearchesFetcher.data.totalPages > 1 && (
                                <div className="flex justify-center mt-4">
                                    <div className="btn-group space-x-2">
                                        {Array.from({ length: previousSearchesFetcher.data.totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                className={`btn ${page === currentPage ? 'btn-active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </>
            ) : (
                <Outlet />
            )}
        </div>
    );
}

type FetcherData = {
    painPoints?: Array<{ topic: string; description: string }>;
    discussedTopics?: Array<{ topic: string; description: string }>;
    error?: string;
    videoTitle?: string;
    videoUrl?: string;
    thumbnailUrl?: string | null;
};

