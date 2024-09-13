import OpenAI from "openai";

export async function getFromGPT(comments: string) {

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant, very good at understanding people's problems with art. You will only give me an array of 3 items, in JSON format. Do not name the array. Just return the JSON array. You always return ONLY the JSON array with no additional description or context. DO not return the code block, just a JSON string" },
            {
                role: "user",
                content: "Give me a list of the 3 things people have most issues with in the following comments: " + comments,
            },
        ],
    });
    if (!completion.choices[0].message || !completion.choices[0].message.content) {
        throw new Error('No response from GPT or invalid response format');
    }
    try {
        const parsed = JSON.parse(completion.choices[0].message.content);
        return { gpt: parsed, error: false }
    } catch (e) {
        return { gpt: [], error: true }
    }
}