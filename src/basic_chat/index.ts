import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();
const encoder = encoding_for_model("gpt-4o-mini");

const MAX_TOKEN = 100;

const initialMessage: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot",
  },
];

async function addNewMessage() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: initialMessage,
  });

  console.log(response.choices[0].message.content);
  
  initialMessage.push({
    role: "assistant",
    content: response.choices[0].message.content,
  });

  if(response.usage && response.usage.total_tokens > MAX_TOKEN) {
    deleteOlderMessages();
  }
}

function deleteOlderMessages() {
    let contextLength = getContextLength();
    console.log(contextLength);
}

function getContextLength() {
    let length = 0;
    initialMessage.forEach((message) => {
        if(typeof message.content === "string") {
            length += encoder.encode(message.content).length;
        }else if(Array.isArray(message.content)) {
            message.content.forEach((messageContent) => {
                if(messageContent.type === "text") {
                    length += encoder.encode(messageContent.text).length;
                }
            })
        }
    });

    return length;
}


process.stdin.addListener("data", async (buffer) => {
  const userInput = buffer.toString();

  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: userInput,
  };

  initialMessage.push(userMessage)

  await addNewMessage();
});
