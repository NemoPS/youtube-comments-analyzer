import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { sb } from "~/api/sb";

// Define types for our data structure
interface PainPoint {
    topic: string;
    description: string;
}

interface DiscussedTopic {
    topic: string;
    description: string;
}

interface SearchResult {
    id: string;
    video_title: string;
    video_url: string;
    thumbnail_url: string;
    pain_points: PainPoint[];
    discussed_topics: DiscussedTopic[];
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    const { data: search, error } = await supabase
        .from('youtube_searches')
        .select('*')
        .eq('id', params.searchId)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error("Error fetching search:", error);
        return json({ error: "Failed to fetch search" }, { status: 500 });
    }

    return json({ search });
};

export default function SingleSearchPage() {
    const data = useLoaderData<{ search: SearchResult }>();

    if ('error' in data) {
        return <div className="text-error">{data.error}</div>;
    }

    if (!data.search) {
        return <div>Search not found</div>;
    }

    const { search } = data;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{search.video_title}</h1>
                <Link to="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="rounded-lg overflow-hidden mb-4">
                        <img
                            src={search.thumbnail_url || "/placeholder.svg"}
                            alt="Video Thumbnail"
                            className="w-full aspect-video object-cover"
                        />
                    </div>
                    <a
                        href={search.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mb-4 inline-block"
                    >
                        View on YouTube
                    </a>
                    <h3 className="text-xl font-bold mb-4">Discussed Topics</h3>
                    <div className="grid gap-4">
                        {search.discussed_topics.map((topic, index) => (
                            <div key={index} className="bg-base-200 rounded-lg p-4">
                                <h4 className="text-lg font-bold mb-2">{topic.topic}</h4>
                                <p className="text-base-content/70">{topic.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Top Pain Points</h3>
                    <div className="grid gap-4">
                        {search.pain_points.map((point, index) => (
                            <div key={index} className="bg-base-200 rounded-lg p-4">
                                <h4 className="text-lg font-bold mb-2">{point.topic}</h4>
                                <p className="text-base-content/70">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}