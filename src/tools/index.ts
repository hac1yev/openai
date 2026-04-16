import OpenAI from "openai";
import {
  getAvailableFlights,
  getCurrentTimeInBaku,
  getOrderStatus,
  reserveFlight,
} from "../utils";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI();

const context: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that can use tools to answer questions.",
  },
];

async function callOpenAIWithTools() {
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
        },
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Get the status of an order given its ID.",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The ID of the order to check",
              },
            },
            required: ["orderId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getAvailableFlights",
          description: "Get available flights between two cities.",
          parameters: {
            type: "object",
            properties: {
              departure: {
                type: "string",
                description: "The city of departure",
              },
              destination: {
                type: "string",
                description: "The city of destination",
              },
            },
            required: ["departure", "destination"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "reserveFlight",
          description: "Reserve a flight given its number.",
          parameters: {
            type: "object",
            properties: {
              flightNumber: {
                type: "string",
                description: "The number of the flight to reserve",
              },
            },
            required: ["flightNumber"],
          },
        },
      },
    ],
    tool_choice: "auto", // the engine will decide which tool to use based on the user query
  });

  // decide if the model wants to call the tool
  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";
  const toolCall = response.choices[0].message.tool_calls![0];
  if (willInvokeFunction) {
    if (toolCall.type === "function") {
      switch (toolCall.function.name) {
        case "getCurrentTimeInBaku":
          const toolResponse = getCurrentTimeInBaku();

          context.push(response.choices[0].message);
          context.push({
            role: "tool",
            content: toolResponse,
            tool_call_id: toolCall.id,
          });
          break;
        case "getOrderStatus":
          const rawArgs = toolCall.function.arguments as any;
          const parsedArgs = JSON.parse(rawArgs);
          const orderStatus = getOrderStatus(parsedArgs.orderId);

          context.push(response.choices[0].message);
          context.push({
            role: "tool",
            content: orderStatus,
            tool_call_id: toolCall.id,
          });
          break;
        case "getAvailableFlights":
          const rawArgsForFlights = toolCall.function.arguments as any;
          const parsedArgsForFlights = JSON.parse(rawArgsForFlights);
          const availableFlights = getAvailableFlights(
            parsedArgsForFlights.departure,
            parsedArgsForFlights.destination,
          );
          context.push(response.choices[0].message);
          context.push({
            role: "tool",
            content: availableFlights.toString(),
            tool_call_id: toolCall.id,
          });
          break;
        case "reserveFlight":
          const rawArgsForReserve = toolCall.function.arguments as any;
          const parsedArgsForReserve = JSON.parse(rawArgsForReserve);
          const reservationResult = reserveFlight(
            parsedArgsForReserve.flightNumber,
          );
          context.push(response.choices[0].message);
          context.push({
            role: "tool",
            content: reservationResult,
            tool_call_id: toolCall.id,
          });
          break;
        default:
          break;
      }
    }
  }

  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: context,
  });

  console.log(finalResponse.choices[0].message.content);
}

process.stdin.addListener("data", async (buffer) => {
  const userInput = buffer.toString();
  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: userInput,
  };
  context.push(userMessage);
  await callOpenAIWithTools();
});
