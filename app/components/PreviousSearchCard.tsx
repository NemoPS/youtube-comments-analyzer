import { Link } from "@remix-run/react";

type PreviousSearch = {
    id: string;
    video_url: string;
    video_title: string;
    thumbnail_url: string | null;
    pain_points: Array<{ topic: string; description: string }>;
    discussed_topics: Array<{ topic: string; description: string }>;
};

type PreviousSearchCardProps = {
    search: PreviousSearch;
};

export function PreviousSearchCard({ search }: PreviousSearchCardProps) {
    return (
        <Link
            to={`/dashboard/search/${search.id}`}
            className="bg-base-200 p-4 rounded-lg shadow-md cursor-pointer hover:bg-base-300 transition-colors text-left w-full flex items-center"
        >
            {search.thumbnail_url && (
                <img
                    src={search.thumbnail_url}
                    alt={search.video_title}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                />
            )}
            <div>
                <p className="font-semibold mb-1">{search.video_title}</p>
            </div>
        </Link>
    );
}