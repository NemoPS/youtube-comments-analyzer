import { google } from "googleapis";

// Function to create the youtube object
function createYoutubeClient() {
    if (typeof window === 'undefined') {
        // Server-side
        return google.youtube({
            version: "v3",
            auth: process.env.YOUTUBE_API_KEY,
        });
    }
    // Client-side
    return null;
}

export async function loadComments(videoUrl: string) {
    const videoId = extractVideoId(videoUrl);
    console.log('Extracted Video ID:', videoId); // Keep this line for debugging
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    try {
        const youtube = createYoutubeClient();
        if (!youtube) {
            throw new Error('YouTube client not available');
        }

        // Fetch video details
        const videoResponse = await youtube.videos.list({
            part: ['snippet'],
            id: [videoId]
        });

        const videoTitle = videoResponse.data.items?.[0]?.snippet?.title || 'Unknown Title';

        // Fetch comments
        let comments: string[] = [];
        let nextPageToken: string | undefined;
        const maxComments = 400; // Increase this number to fetch more comments

        do {
            const response = await youtube.commentThreads.list({
                part: ['snippet'],
                videoId: videoId,
                maxResults: 100,
                pageToken: nextPageToken
            });

            const newComments = response.data.items?.map(item =>
                item.snippet?.topLevelComment?.snippet?.textDisplay || ''
            ) || [];

            comments = [...comments, ...newComments];
            nextPageToken = response.data.nextPageToken || undefined;
        } while (nextPageToken && comments.length < maxComments);

        return {
            title: videoTitle,
            comments,
            thumbnailUrl: videoResponse.data.items?.[0]?.snippet?.thumbnails?.standard?.url || null,
            videoId // Ensure this is always included
        };
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        throw error;
    }
}

export function extractVideoId(url: string): string | null {
    // Updated regex to handle various YouTube URL formats, including those with timestamps
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Remove unused functions and exports