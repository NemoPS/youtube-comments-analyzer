export type SearchDetailsProps = {
    videoTitle: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    painPoints: Array<{ topic: string; description: string }>;
    discussedTopics: Array<{ topic: string; description: string }>;
};

export default function SearchDetails({
    videoTitle,
    videoUrl,
    thumbnailUrl,
    painPoints,
    discussedTopics,
}: SearchDetailsProps) {
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
                    <h4 className="text-lg font-semibold mb-2">Top Pain Points:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        {painPoints.map((point, index) => (
                            <li key={index}>
                                <strong>{point.topic}:</strong> {point.description}
                            </li>
                        ))}
                    </ul>
                    <h4 className="text-lg font-semibold mb-2">Most Discussed Topics:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        {discussedTopics.map((topic, index) => (
                            <li key={index}>
                                <strong>{topic.topic}:</strong> {topic.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}