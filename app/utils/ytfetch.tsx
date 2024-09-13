import { google } from "googleapis";


export async function getSubscribers(channelId: string) {
    const youtube = google.youtube({
        version: "v3",
        auth: process.env.YOUTUBE_API_KEY, // Use your API key from environment variables
    });
    const subs = await youtube.subscriptions.list({
        part: ["snippet"],
        channelId: channelId, // Replace with your desired channel ID
    });
    console.log(subs.data);

    return subs;


}

export async function loadComments(videoUrl: string) {

    // TODO better error handling
    if (!isValidYouTubeUrl(videoUrl)) {
        return [];
    }
    const videoId = getYouTubeVideoId(videoUrl);
    console.log('fetching');

    // Initialize the YouTube API client
    const youtube = google.youtube({
        version: "v3",
        auth: process.env.YOUTUBE_API_KEY, // Use your API key from environment variables
    });

    const video = await youtube.videos.list({
        part: ["snippet"],
        id: videoId, // Replace with your desired video ID
    });
    const videostats = video.data.items ? video.data.items[0] : null
    const thumbnail = videostats?.snippet?.thumbnails?.medium?.url;
    const title = videostats?.snippet?.title;


    // Fetch comment threads from a specific YouTube video
    const commentThreads = await youtube.commentThreads.list({
        part: ["snippet"],
        videoId: videoId, // Replace with your desired video ID
        maxResults: 50,
        order: "relevance",
        textFormat: "plainText",
    })
        ;


    // Extract the messages from the comment threads
    const messages = commentThreads.data.items?.map(
        (item) => item.snippet?.topLevelComment?.snippet?.textDisplay
    ) ?? [];

    // TODO what if not enough messages?
    // Return the array of messages
    return messages;
}

function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/.*(?:\/|v=|\/v\/|embed\/|youtu\.be\/)|youtu\.be\/|v=)([^#&?]*).*/;
    const match = url.match(regex);
    return match && match[1].length === 11 ? match[1] : null;
}

function isValidYouTubeUrl(url) {
    // Regular expression to match valid YouTube video URLs
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\w+\/videos|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?$/;
    return youtubeUrlPattern.test(url);
}


export const demoComments = [
    "Pikats like that cool aunt we all wish we had growing up for real. The way she breaks things down for artists of any knowledge basically is such a high value",
    "Boxes is life, life is boxes",
    "This video only proves that EVERY young artist should start with Draw A Box course, I still shiver whenever I remember HUNDREDS of pages filled with overlaping long continuous lines, rectangles with elipses, and even BOXES, its like artist's Vietnam but now I can confidently draw forms in perspective/3d space and lines with full control, this may not seem like much but its sooo good when such basics stop troubling you so you can free up your mind of those and put it to solve actual dificult fundamentals!",
    "What I like about your videos is that you follow a logic on what to learn and what to do to learn those things. Most art tutorials that I see just tells things as they are and don't actually teach you how to practice. For example, a common art tutorial about boxes would just say that you have to draw in perspective, but wouldn't actually show you those lines and diagonals and proportion techniques like you did. This is why I like your channel :) please keep it up!",
    "I was just thinking about how to draw the human figure with boxes, and youtube recommended this to me\r\nWhat a unique coordination",
    "5:25 that is actually S tier technique, thank oyu!",
    "I am grateful for the cube (and by extension basic forms, lines, and ellipse practice). It is the great filter where you get to see Dunning-Kruger in full effect.",
    "this is so well timed 😭",
    "just from your \"avatar\", I knew instantly that you're gonna cook something",
    "Felt so motivated and un- intimidated by it all, but the SECOND you mentioned I STILL need to learn the ENTIRETY of anatomy, I gen. don't feel like trying. Every time I hope that I can learn something, there's always another entirely different thing that is WAY less simple and WAY more tedious. I just wanna draw things good, not have more homework to constantly worry about😭",
    "I've been doing this for 20 years and it never occurred to me to combine Loomis and Rob Scotterson's techniques to replicate the proportion grid in perspective..... Heckin' heck.",
    "Insane timing, I’ve been searching for this exact thing",
    "Imo if you are starting out better to use boxes then add spherical forms inside the boxes to then add the muscles on top of later down the road this also helps you better place your spheres in perspective and actually gives you a solid idea of where it's going as I know when I first started getting into anatomy I was not good with cross contours and showing their form with them (they always felt flat) so I found what worked for me was box then sphere",
    "If I can give you some feedback: I loove these videos in which you show a glimpse of the hard-work you go and went through. It leaves me inspired to deepen my studies more and more.",
    "just what i needed actually!",
    "0:50 WHY square undies are the best",
    "Somehow you posted exactly the video I needed, exactly at the time I'm needing it. The very next day I discovered your channel. Almost scary.\nI've seen videos about fundamentals of perspectve but they didn't show as clearly the whole process from going to those basis to actual drawing of people and how \"No, it's not because you stop drawing the boxes at some point they are useless\"",
    "my problem is putting the bodies in the boxes in perspective. it never works and always makes it harder to do and makes it so unnatural looking 😭",
    "BOXES, BOXES, BOOOOXESS!!!! Seriously though, thank you for putting this in perspective, I'm lucky enough to have a teacher who provided me with these methods early on, but it's sort of enlightening to see someone else's approach and how everything chains together, you explain really well!",
    "love pikat soo.. much 😭 been looking for someone who explains the box theory properly,  thanks a lot Noona",
    "I was stuck on drawing the human figure beyond just boxes and honestly this helped so much. Thank you ❄️",
    "I love that I can still use my imagination to do the box manequin, sadly adhd nerfs it by imagining 7000 things every second",
    "As I've been trying to git gud at art, it's funny, Pikat always seems to upload the exact thing I've been trying to learn, right when I need it. It's like magic, or as if she's reading my mind with psychic power, or something, lol.",
    "Your last boxes video has me actually drawing people who look like people! can't wait!",
    "It is always scary when YT reads ur thoughts and gives u the right video to answer the question in ur head",
    "Learning boxes is like learning the alphabet. It feels like a far shot from getting to the creative part, but it sure does add to the end result if you learn it.\n\nEdit: You are literally the first one I have stumbled across who actually put into the words the connection between boxes and anatomy. I can find instructions for the two separately, but no one really put into words how to connect them. Thanks for sharing.",
    "I've actually been making progress on my boxes lately once I started trying to pay attention to the 3 vanishing points, and understood this stuff already. At least in concept; I'm not very practiced at it yet. Right now I'm more interested on why my lines are so wobbly on the tablet. I may check your videos for that; your explanations are the ones making these concepts finally click for me.",
    "So cool of you to make approachable videos about boxes 🙏",
    "Wait the drawing circles with boxes was kind of mind blowing...😭",
    "Amazing video like always Pikat! These DOVA SYNDROME songs are throwing me off due to the amount of vtubers and vtuber clippers I watch haha",
    "accidentally clicked thinking it was a 3D model poly modeling video, now i can draw what witch craft is this",
    "You persuaded me to start drawing EVERYTHING in boxes! Not only breast and pelvis... I need more love for boxes to improve my proportion and anatomy skills 😂😅 ... Thank you! Nice Video! Love to watch your videos :)",
    "I understand how to draw the body as boxes, and it helps me with perspective and stuff, but I struggle with going from boxes to like.. body shapes.. and noone ever talks abt that",
    "Oh my god I have been waiting for this video for so long",
    "the timing is crazy just as i was struggling with this",
    "Nice thumb. Perfect for edits",
    "Babe wake up, new Pikat drawing boxes tutorial just dropped.",
    "You are quite the inspiration, good work!",
    "Pikat was there when we needed her most...",
    "thank you for being innumerably better than my highschool art teacher ♥",
    "Math Teacher: told you, just wait until little Johnny buys those 250 watermelons",
    "Oh wow, something just clicked. Now I need to practice...",
    "Super useful video",
    "Thanks i need this Tip and Expansion ❤",
    "I never thought i will need to watch this video,woww,new knowlegde achieve",
    "In fact... I really love drawing boxes!\nI should really consider consulting :P",
    "hi Pikat! i just wanted to say i’ve been really sick today and watching this was the first thing i did after wasting away in bed for several hours, and i genuinely feel a lot better now :](mentally that is, i still feel like shit physically)\nthis was so helpful, especially the tip about ellipses- i will absolutely be putting that into practice, ive been trying to freehand them for years and obviously it hasnt worked out very well 😭 tysm for the awesome video :D",
    "You must learn the way of the BOX fellow artist... 'tis a journey we all must undertake...",
    "Tonight is box study night!",
    "love this"
]