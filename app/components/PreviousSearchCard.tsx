type PreviousSearch = {
    video_url: string;
    video_title: string;
    thumbnail_url: string | null;
    pain_points: string[];
};

type PreviousSearchCardProps = {
    search: PreviousSearch;
    onClick: () => void;
};

export function PreviousSearchCard({ search, onClick }: PreviousSearchCardProps) {
    return (
        <button
            className="bg-base-200 p-4 rounded-lg shadow-md cursor-pointer hover:bg-base-300 transition-colors text-left w-full flex items-center"
            onClick={onClick}
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
        </button>
    );
}