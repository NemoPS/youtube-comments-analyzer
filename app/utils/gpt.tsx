import OpenAI from "openai";

export async function getFromGPT(comments: string) {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant, very good at analyzing YouTube comments. You will provide an analysis of the comments, including the top 3 pain points and the top 5 most discussed topics. Return your analysis as a JSON object with two arrays: 'painPoints' and 'discussedTopics'. Each array should contain objects with 'topic' and 'description' fields. Do not include any markdown formatting or additional text in your response, just the JSON object."
            },
            {
                role: "user",
                content: "Analyze the following YouTube comments and provide the top 3 pain points and top 5 most discussed topics: " + comments,
            },
        ],
    });

    if (!completion.choices[0].message || !completion.choices[0].message.content) {
        throw new Error('No response from GPT or invalid response format');
    }

    try {
        // Remove any markdown formatting
        const cleanedContent = completion.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanedContent);
        return { gpt: parsed, error: false };
    } catch (e) {
        console.error("Error parsing GPT response:", e);
        console.error("Raw GPT response:", completion.choices[0].message.content);
        return { gpt: { painPoints: [], discussedTopics: [] }, error: true };
    }
}