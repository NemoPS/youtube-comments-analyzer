export function LoadingIndicator() {
    return (
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50">
            <div className="h-full w-1/3 bg-accent animate-loading-bar"></div>
        </div>
    );
}