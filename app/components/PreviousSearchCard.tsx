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
            className="bg-base-200 p-4 rounded-lg shadow-md cursor-pointer hover:bg-base-300 transition-colors text-left w-full"
            onClick={onClick}
        >
            <p className="font-semibold truncate">{search.video_title}</p>
        </button>
    );
}