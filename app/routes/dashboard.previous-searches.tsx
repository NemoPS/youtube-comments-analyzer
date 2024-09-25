import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { sb } from "~/api/sb";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers = new Headers();
    const supabase = sb(request, headers);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return json({ error: "User not authenticated" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = 20;

    const { data: previousSearches, error, count } = await supabase
        .from('youtube_searches')
        .select('id, video_title, thumbnail_url', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
        console.error("Error fetching previous searches:", error);
        return json({ error: "Failed to fetch previous searches" }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    return json({
        previousSearches: previousSearches || [],
        totalPages,
        currentPage: page
    });
};