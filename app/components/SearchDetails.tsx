export type SearchDetailsProps = {
    videoTitle: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    painPoints: string[];
    onClose?: () => void;
    onDelete?: () => void; // Add this line
};

export function SearchDetails({ videoTitle, videoUrl, thumbnailUrl, painPoints, onClose, onDelete }: SearchDetailsProps) {
    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-dotted-pattern"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{videoTitle}</h3>
                    {onClose && (
                        <button onClick={onClose} className="text-xl font-bold">
                            &times;
                        </button>
                    )}
                </div>
                <div className="flex flex-col md:flex-row items-start mb-4">
                    {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-auto rounded-md shadow-md" />
                    ) : (
                        <div className="w-full h-0 pb-[56.25%] bg-gray-300 rounded-md flex items-center justify-center shadow-md">
                            <span className="text-gray-500">No thumbnail</span>
                        </div>
                    )}
                    <div className="w-full md:w-2/3">
                        <h2 className="text-2xl font-bold mb-2">Pain Points</h2>
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4 inline-block">
                            Watch Video
                        </a>
                        <ul className="list-disc pl-5 space-y-2">
                            {painPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                {onDelete && (
                    <div className="mt-4 text-right">
                        <button onClick={onDelete} className="btn btn-sm btn-error">
                            Delete Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}