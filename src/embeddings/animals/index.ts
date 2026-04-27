import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";

const openai = new OpenAI();

export interface DataWithEmbeddings {
    input: string;
    embedding: number[];
}

/**
 * Generates embeddings (numeric representations) for given text input.
 * 
 * input - A single string or an array of strings
 * returns OpenAI response containing embeddings for each input
 */
export async function generateEmbeddings(input: string | string[]) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input
    });

    return response;
}

/**
 * Loads and parses a JSON file from the current directory.
 * 
 * fileName - Name of the JSON file
 * returns Parsed JSON data with generic type T
 */
export function loadJSONData<T>(fileName: string): T {
    const path = join(__dirname, fileName);
    const rawData = readFileSync(path);
    
    return JSON.parse(rawData.toString());
}

/**
 * Saves given data into a JSON file.
 * 
 * data - Any data to be saved
 * fileName - Name of the output JSON file
 */
function saveDataToJsonFile(data: any, fileName: string) {
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString);
    const path = join(__dirname, fileName);
    writeFileSync(path, dataBuffer);
    console.log(`save data to ${fileName}`); 
}

/**
 * Main function:
 * - Loads input data from JSON
 * - Generates embeddings for each item
 * - Combines original data with embeddings
 * - Saves result to a new JSON file
 */
async function main() {
    const data = loadJSONData<string[]>('data.json');
    const embeddings = await generateEmbeddings(data);    

    const dataWithEmbeddings: DataWithEmbeddings[] = [];

    for (let i = 0; i < data.length; i++) {
        dataWithEmbeddings.push({
            input: data[i],
            embedding: embeddings.data[i]?.embedding
        });
    }    

    saveDataToJsonFile(dataWithEmbeddings, 'dataWithEmbeddings.json');
}

main();