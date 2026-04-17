import OpenAI from "openai";
import { createReadStream, writeFileSync } from "fs";

const openai = new OpenAI();

async function createTranscription() {
    const response = await openai.audio.transcriptions.create({
        file: createReadStream("AudioSample.m4a"),
        model: "whisper-1", 
        language: "en",        
    });

    console.log(response);
}

async function createTranslation() {
    // it will translate into english by default
    const response = await openai.audio.translations.create({
        file: createReadStream("FrenchSample.m4a"),
        model: "whisper-1",
    });

    // Now we will translate the English response text into Azerbaijan using GPT-4o
    const translationText = await openai.responses.create({
        model: "gpt-4o",
        input: `Translate the following text to Azerbaijan: ${response.text}`,
    })

    console.log(translationText);
}

async function textToSpeech() {
    const response = await openai.audio.speech.create({
        model: "tts-1",
        input: "Hello, how are you doing today?",
        voice: "alloy", 
        response_format: "mp3"
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync("output.mp3", buffer);
}


// createTranscription();
// createTranslation();
textToSpeech();