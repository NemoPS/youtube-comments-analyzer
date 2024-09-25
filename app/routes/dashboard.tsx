import { useState, useEffect } from "react";
import { useLoaderData, useNavigation, useFetcher, Outlet, useLocation, Link, useSearchParams } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import { DummySearchCard } from "~/components/DummySearchCard";
import { PreviousSearchCard } from "~/components/PreviousSearchCard";
import { loadComments } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";
import { Spinner } from "~/components/Spinner";
import { Toaster } from 'react-hot-toast';
import { showCustomToast } from '~/components/CustomToast';
import { TransitionWrapper } from "~/components/TransitionWrapper";

type User = {
    id: string;
    email: string;
    // Add other user properties as needed
};

// Add these functions at the top of the file, outside of the component
function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

function isYoutubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
    return youtubeRegex.test(url);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/", { headers });
    }

    // Fetch user's credits
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return json({ error: "Failed to fetch user profile" }, { status: 500 });
    }

    return json({
        user,
        credits: profile.credits,
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

    // Server-side validation
    if (!isValidUrl(youtubeUrl)) {
        return json({ error: "Please enter a valid URL" }, { status: 400 });
    }
    if (!isYoutubeUrl(youtubeUrl)) {
        return json({ error: "Please enter a valid YouTube video URL" }, { status: 400 });
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
    const { user, credits } = useLoaderData<typeof loader>();
    const location = useLocation();
    const [searchParams] = useSearchParams();
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
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [urlError, setUrlError] = useState("");

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isLoadingPreviousSearches, setIsLoadingPreviousSearches] = useState(true);


    // Load previous searches only on initial component mount
    useEffect(() => {
        if (isInitialLoad) {
            previousSearchesFetcher.load(`/dashboard/previous-searches?page=${currentPage}`);
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, currentPage]);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setYoutubeUrl(value);
        if (!value) {
            setUrlError("");
        } else if (!isValidUrl(value)) {
            setUrlError("Please enter a valid URL");
        } else if (!isYoutubeUrl(value)) {
            setUrlError("Please enter a valid YouTube video URL");
        } else {
            setUrlError("");
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!youtubeUrl || !isValidUrl(youtubeUrl) || !isYoutubeUrl(youtubeUrl)) {
            setUrlError("Please enter a valid YouTube URL");
            return;
        }
        setIsSearching(true);
        fetcher.submit(
            { youtubeUrl },
            { method: "post", action: "/dashboard" }
        );
    };

    useEffect(() => {
        if (previousSearchesFetcher.state === "loading" && !isSearching) {
            setIsLoadingPreviousSearches(true);
        } else if (previousSearchesFetcher.state === "idle") {
            setIsLoadingPreviousSearches(false);
        }
    }, [previousSearchesFetcher.state, isSearching]);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            setIsSearching(false);
            if ('error' in fetcher.data && fetcher.data.error) {
                // Show error toast
                showCustomToast({
                    message: fetcher.data.error,
                    type: 'error'
                });
            } else {
                // Show success toast and reset form
                setYoutubeUrl("");
                showCustomToast({
                    message: "Video analysis completed successfully!",
                    type: 'success'
                });
                // Reload previous searches
                previousSearchesFetcher.load(`/dashboard/previous-searches?page=${currentPage}`);
            }
        }
    }, [fetcher.state, fetcher.data, currentPage]);

    useEffect(() => {
        const paymentSuccess = searchParams.get('paymentSuccess');

        if (paymentSuccess === 'true') {
            showCustomToast({
                message: "Payment successful! Your credits have been added.",
                type: 'success'
            });
            // Remove the parameter from the URL without triggering a page reload
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('paymentSuccess');
            window.history.replaceState({}, document.title, newUrl.toString());
        }
    }, [searchParams]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        previousSearchesFetcher.load(`/dashboard/previous-searches?page=${newPage}`);
    };

    return (
        <TransitionWrapper>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Toaster />
                {isMainDashboard && (
                    <>
                        <h1 className="text-3xl font-bold mb-6">Analyze a new video</h1>
                    </>
                )}

                {isMainDashboard ? (
                    <>
                        {credits > 0 ? (
                            <fetcher.Form method="post" className="mb-8" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="youtubeUrl"
                                            value={youtubeUrl}
                                            onChange={handleUrlChange}
                                            placeholder="Enter YouTube URL"
                                            className={`input input-bordered flex-grow ${urlError ? 'input-error' : ''}`}
                                            required
                                            disabled={isSearching}
                                        />
                                        <button
                                            type="submit"
                                            className={`btn btn-primary ${isSearching ? 'btn-disabled' : ''}`}
                                            disabled={isSearching || !!urlError}
                                        >
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
                                    {urlError && <p className="text-error text-sm">{urlError}</p>}
                                </div>
                            </fetcher.Form>
                        ) : (
                            <div className="border border-yellow-400 border-l-4 p-4 mb-8 rounded-md shadow-sm">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>You have no credits left. Please <Link to="/buy-credits" className="text-blue-500 underline">purchase more credits</Link> to analyze videos.</span>
                                </div>
                            </div>
                        )}

                        <div className="transition-opacity duration-300 ease-in-out">
                            {isLoadingPreviousSearches && !isSearching ? (
                                <div className="flex justify-center items-center h-64">
                                    <Spinner size="lg" />
                                </div>
                            ) : previousSearchesFetcher.data ? (
                                <div className={`${isLoadingPreviousSearches ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                                    {previousSearchesFetcher.data.previousSearches.length > 0 && (
                                        <>
                                            <h2 className="text-2xl font-bold mb-4">Previous Searches</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {isSearching && <DummySearchCard />}
                                                {previousSearchesFetcher.data.previousSearches
                                                    .slice(0, isSearching ? -1 : undefined)
                                                    .map((search, index) => (
                                                        <div
                                                            key={search.id}
                                                            className="opacity-0 animate-fade-in"
                                                            style={{ animationDelay: `${index * 50}ms` }}
                                                        >
                                                            <PreviousSearchCard search={search} />
                                                        </div>
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
                                    )}
                                    {previousSearchesFetcher.data.previousSearches.length === 0 && !isSearching && (
                                        <div className="text-center text-base-content/70 mt-8">
                                            No previous searches found. Start by analyzing a YouTube video above!
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </>
                ) : (
                    <Outlet />
                )}
            </div>
        </TransitionWrapper>
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

type FetcherData = {
    painPoints?: Array<{ topic: string; description: string }>;
    discussedTopics?: Array<{ topic: string; description: string }>;
    error?: string;
    videoTitle?: string;
    videoUrl?: string;
    thumbnailUrl?: string | null;
};

