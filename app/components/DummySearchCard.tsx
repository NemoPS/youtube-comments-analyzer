
export function DummySearchCard() {
    return (
        <div className="mb-8 bg-base-200 p-6 rounded-lg shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-dotted-pattern"></div>
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start mb-4">
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
                        <div className="w-full h-0 pb-[56.25%] bg-base-300 rounded-md animate-pulse-fast"></div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <div className="h-8 bg-base-300 rounded mb-2 animate-pulse-fast"></div>
                        <div className="h-6 bg-base-300 rounded mb-2 w-3/4 animate-pulse-fast"></div>
                        <div className="h-4 bg-base-300 rounded mb-4 w-1/2 animate-pulse-fast"></div>
                        <div className="space-y-2">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="h-4 bg-base-300 rounded w-full animate-pulse-fast"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}