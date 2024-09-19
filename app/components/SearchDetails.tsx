export type SearchDetailsProps = {
    videoTitle: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    painPoints: string[];
    onClose?: () => void;
    onDelete?: () => void; // Add this line
};

export default function SearchDetails({ videoTitle, videoUrl, thumbnailUrl, painPoints, onClose, onDelete }: SearchDetailsProps) {
    return (
        <div className="bg-base-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="md:w-1/2 mb-4 md:mb-0">
                    <h3 className="text-xl font-bold mb-2">{videoTitle}</h3>
                    {thumbnailUrl && (
                        <img
                            src={thumbnailUrl}
                            alt={videoTitle}
                            className="w-full h-auto rounded-lg mb-2"
                        />
                    )}
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        View on YouTube
                    </a>
                </div>
                <div className="md:w-1/2">
                    <h4 className="text-lg font-semibold mb-2">Pain Points:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        {painPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
            </div>
            {onClose && (
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="btn btn-ghost">
                        Close
                    </button>
                    {onDelete && (
                        <button onClick={onDelete} className="btn btn-error">
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}