import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { sb } from "~/api/sb";
import SearchDetails from "~/components/SearchDetails";

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
    const data = useLoaderData<typeof loader>();

    if ('error' in data) {
        return <div className="text-error">{data.error}</div>;
    }

    if (!data.search) {
        return <div>Search not found</div>;
    }

    const { search } = data;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/dashboard" className="btn btn-ghost mb-4">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold mb-6">Search Results</h1>
            <SearchDetails
                videoTitle={search.video_title}
                videoUrl={search.video_url}
                thumbnailUrl={search.thumbnail_url}
                painPoints={search.pain_points}
                discussedTopics={search.discussed_topics}
            />
        </div>
    );
}