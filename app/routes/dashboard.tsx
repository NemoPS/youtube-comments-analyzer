import { useState, useEffect, useRef } from "react";
import { useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";
import { loadComments } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";
import { PreviousSearchCard } from "../components/PreviousSearchCard";

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

    // dummy timeout to simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // // Uncomment the following line to use dummy data instead of real API calls
    return json({ painPoints: getDummyPainPoints() });

    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data } = await supabase.auth.getUser();
    const user = data.user as User | null;

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const { title, comments, thumbnailUrl } = await loadComments(youtubeUrl);
        const { gpt, error } = await getFromGPT(comments.join("\n"));

        if (error) {
            return json({ error: "Failed to analyze comments" }, { status: 500 });
        }

        // Save the search data to the youtube_searches table
        const { error: videoError } = await supabase
            .from('youtube_searches')
            .insert({
                user_id: user.id, // This is now safe as we've checked for null above and asserted the type
                video_url: youtubeUrl,
                video_title: title,
                thumbnail_url: thumbnailUrl,
                pain_points: gpt
            });

        if (videoError) {
            console.error("Error saving search data:", videoError);
            return json({ error: "Failed to save search data" }, { status: 500 });
        }

        return json({ painPoints: gpt, videoTitle: title, videoUrl: youtubeUrl, thumbnailUrl });
    } catch (error) {
        console.error("Error processing YouTube data:", error);
        return json({ error: "Failed to process YouTube data" }, { status: 500 });
    }
};

export default function Dashboard() {
    const { flashMessage, user, previousSearches } = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const fetcher = useFetcher<{
        painPoints?: string[];
        error?: string;
        videoTitle?: string;
        videoUrl?: string;
        thumbnailUrl?: string | null;
    }>();
    const [selectedSearch, setSelectedSearch] = useState<LoaderData['previousSearches'][0] | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isSearching, setIsSearching] = useState(false);

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
                <div className="mb-8 bg-base-200 p-6 rounded-lg shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-dotted-pattern"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start mb-4">
                            <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
                                <div className="w-full h-0 pb-[56.25%] bg-base-300 rounded-md animate-pulse-fast"></div>
                            </div>
                            <div className="w-full md:w-2/3">
                                <div className="h-8 bg-base-300 rounded mb-2 animate-pulse-fast"></div>
                                <div className="h-6 bg-base-300 rounded mb-2 w-3/4 animate-pulse-fast"></div>
                                <div className="h-4 bg-base-300 rounded mb-4 w-1/2 animate-pulse-fast"></div>
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="h-4 bg-base-300 rounded w-full animate-pulse-fast"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                fetcher.data && fetcher.data.painPoints && (
                    <div className="mb-8 bg-base-200 p-6 rounded-lg shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5 bg-dotted-pattern"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start mb-4">
                                <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
                                    {fetcher.data.thumbnailUrl ? (
                                        <img src={fetcher.data.thumbnailUrl} alt="Video thumbnail" className="w-full h-auto rounded-md shadow-md" />
                                    ) : (
                                        <div className="w-full h-0 pb-[56.25%] bg-gray-300 rounded-md flex items-center justify-center shadow-md">
                                            <span className="text-gray-500">No thumbnail</span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-2/3">
                                    <h2 className="text-2xl font-bold mb-2">Pain Points</h2>
                                    <h3 className="text-lg font-semibold mb-2">{fetcher.data.videoTitle}</h3>
                                    <a href={fetcher.data.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4 inline-block">
                                        Watch Video
                                    </a>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {fetcher.data.painPoints.map((point, index) => (
                                            <li key={index}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}

            {fetcher.data && fetcher.data.error && (
                <div className="alert alert-error mb-8">
                    <span>{fetcher.data.error}</span>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold mb-4">Previous Searches</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previousSearches.map((search, index) => (
                        <PreviousSearchCard
                            key={index}
                            search={search}
                            onClick={() => setSelectedSearch(search)}
                        />
                    ))}
                </div>
            </div>

            {selectedSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div ref={modalRef} className="bg-base-100 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">{selectedSearch.video_title}</h3>
                            <button
                                onClick={() => setSelectedSearch(null)}
                                className="text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row items-start mb-4">
                            {selectedSearch.thumbnail_url ? (
                                <img src={selectedSearch.thumbnail_url} alt="Video thumbnail" className="w-full md:w-1/3 h-auto mb-4 md:mb-0 md:mr-4 rounded-md" />
                            ) : (
                                <div className="w-full md:w-1/3 h-32 bg-gray-300 mb-4 md:mb-0 md:mr-4 rounded-md flex items-center justify-center">
                                    <span className="text-gray-500">No thumbnail</span>
                                </div>
                            )}
                            <div className="w-full md:w-2/3">
                                <a href={selectedSearch.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4 inline-block">
                                    Watch Video
                                </a>
                                <h4 className="font-semibold mb-2">Pain Points:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {selectedSearch.pain_points.map((point, pointIndex) => (
                                        <li key={pointIndex}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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