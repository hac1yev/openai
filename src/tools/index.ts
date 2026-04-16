import OpenAI from "openai";

const openai = new OpenAI();

function getCurrentTimeInBaku() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Baku",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };
    return now.toLocaleTimeString("en-US", options);
}

async function callOpenAIWithTools() {
    const context: OpenAI.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are a helpful assistant that can use tools to answer questions."
        },
        {
            role: "user",
            content: "What is the time in Azerbaijan Baku right now?"
        }
    ];

    // configute the tool to be used by the model
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
        tools: [
            {
                type: "function",
                function: {
                    name: "getCurrentTimeInBaku",
                    description: "Get the current time in Baku, Azerbaijan.",
                }
            }
        ],
        tool_choice: "auto" // the engine will decide which tool to use based on the user query
    });

    // decide if the model wants to call the tool
    console.log(response.choices[0].message.content);
    
}

callOpenAIWithTools()