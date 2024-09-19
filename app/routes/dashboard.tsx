import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useLoaderData, useNavigation, useFetcher, useSubmit, useRevalidator } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import { DummySearchCard } from "~/components/DummySearchCard";
import { PreviousSearchCard } from "~/components/PreviousSearchCard";
import { loadComments } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";
import { Spinner } from "~/components/Spinner"; // Add this import

const SearchDetails = lazy(() => import("~/components/SearchDetails"));

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
                pain_points: gpt
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

        return json({ painPoints: gpt, videoTitle: title, videoUrl: youtubeUrl, thumbnailUrl });
    } catch (error) {
        console.error("Error processing YouTube data:", error);
        return json({ error: "Failed to process YouTube data" }, { status: 500 });
    }
};

export default function Dashboard() {
    const { flashMessage, user } = useLoaderData<typeof loader>();
    const previousSearchesFetcher = useFetcher<{
        previousSearches: {
            id: string;
            video_url: string;
            video_title: string;
            thumbnail_url: string | null;
            pain_points: string[];
        }[];
        totalPages: number;
        currentPage: number;
    }>();

    const [currentPage, setCurrentPage] = useState(1);
    const revalidator = useRevalidator();
    const navigation = useNavigation();
    const fetcher = useFetcher<{
        painPoints?: string[];
        error?: string;
        videoTitle?: string;
        videoUrl?: string;
        thumbnailUrl?: string | null;
    }>();
    const [selectedSearch, setSelectedSearch] = useState<{
        id: string;
        video_title: string;
        video_url: string;
        thumbnail_url: string | null;
        pain_points: string[];
    } | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const submit = useSubmit();

    const [isLoadingPreviousSearches, setIsLoadingPreviousSearches] = useState(true);

    useEffect(() => {
        setIsLoadingPreviousSearches(true);
        previousSearchesFetcher.load(`/dashboard/previous-searches?page=${currentPage}`);
    }, [currentPage]);

    useEffect(() => {
        if (previousSearchesFetcher.state === 'idle') {
            setIsLoadingPreviousSearches(false);
        }
        console.log('Previous searches data:', previousSearchesFetcher.data);
        console.log('Previous searches state:', previousSearchesFetcher.state);
    }, [previousSearchesFetcher.data, previousSearchesFetcher.state]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setSelectedSearch(null);
            }
        }

        function handleEscKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setSelectedSearch(null);
            }
        }

        if (selectedSearch) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [selectedSearch]);

    useEffect(() => {
        if (fetcher.data && fetcher.data.painPoints) {
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

    const handleDelete = (searchId: string) => {
        if (window.confirm("Are you sure you want to delete this search?")) {
            submit({ action: "delete", searchId }, { method: "post" });
            setSelectedSearch(null);
            revalidator.revalidate();
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

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

            {isSearching ? (
                <div className="mb-8">
                    <DummySearchCard />
                </div>
            ) : (
                fetcher.data && fetcher.data.painPoints && (
                    <div className="mb-8">
                        <Suspense fallback={<div>Loading search details...</div>}>
                            <SearchDetails
                                videoTitle={fetcher.data.videoTitle || ""}
                                videoUrl={fetcher.data.videoUrl || ""}
                                thumbnailUrl={fetcher.data.thumbnailUrl || null}
                                painPoints={fetcher.data.painPoints}
                            />
                        </Suspense>
                    </div>
                )
            )}

            {fetcher.data && fetcher.data.error && (
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {previousSearchesFetcher.data.previousSearches.map((search) => (
                            <PreviousSearchCard
                                key={search.id}
                                search={search}
                                onClick={() => setSelectedSearch(search)}
                            />
                        ))}
                    </div>
                    {previousSearchesFetcher.data.totalPages > 1 && (
                        <div className="flex justify-center mt-4">
                            <div className="btn-group">
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
            ) : (
                <div className="text-center py-4">
                    {previousSearchesFetcher.state === 'loading' ? (
                        <Spinner size="lg" />
                    ) : previousSearchesFetcher.data === undefined ? (
                        'No previous searches found.'
                    ) : (
                        'Error loading previous searches. Please try again.'
                    )}
                </div>
            )}

            {selectedSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div ref={modalRef} className="bg-base-100 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
                        <Suspense fallback={<div>Loading search details...</div>}>
                            <SearchDetails
                                videoTitle={selectedSearch.video_title}
                                videoUrl={selectedSearch.video_url}
                                thumbnailUrl={selectedSearch.thumbnail_url}
                                painPoints={selectedSearch.pain_points}
                                onClose={() => setSelectedSearch(null)}
                                onDelete={() => handleDelete(selectedSearch.id)}
                            />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
}

