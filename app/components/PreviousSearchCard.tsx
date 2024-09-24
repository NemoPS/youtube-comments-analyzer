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
            className="bg-base-200 rounded-lg shadow-md cursor-pointer hover:bg-base-300 transition-colors text-left w-full flex flex-col overflow-hidden"
        >
            {search.thumbnail_url && (
                <div className="w-full pb-[56.25%] relative">
                    <img
                        src={search.thumbnail_url}
                        alt={search.video_title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="p-4">
                <p className="font-semibold text-sm line-clamp-2">{search.video_title}</p>
            </div>
        </Link>
    );
}