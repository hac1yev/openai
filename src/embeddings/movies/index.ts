import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { cosineSimilarity } from "../../utils";

const openai = new OpenAI();

async function generateEmbeddings(input: string | string[]) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });

  return response;
}

function loadJSONData(fileName: string) {
  const path = join(__dirname, fileName);
  const stream = readFileSync(path);
  return JSON.parse(stream.toString());
}

async function createEmbeddingMoviesData() {
  const movies = loadJSONData("data.json");
  const movieEmbeddings = await generateEmbeddings(movies);
  const embeddingsData: {
    input: string;
    embedding: number[];
  }[] = [];

  for (let i = 0; i < movies.length; i++) {
    embeddingsData.push({
      input: movies[i],
      embedding: movieEmbeddings.data[i].embedding,
    });
  }

  const stringEmbeddingsData = JSON.stringify(embeddingsData);
  const path = join(__dirname, "dataWithMovieEmbeddings.json");
  writeFileSync(path, stringEmbeddingsData);
}

createEmbeddingMoviesData();

async function searchMovies(input: string) {
  const dataWithEmbeddings = loadJSONData("dataWithMovieEmbeddings.json");
  const inputEmbedding = await generateEmbeddings(input);

  const similarities: {
    input: string;
    similarity: number;
  }[] = [];

  for (const entry of dataWithEmbeddings) {
    const similarity = cosineSimilarity(
      entry.embedding,
      inputEmbedding.data[0].embedding,
    ); // 0.3231232132332 for example
    similarities.push({
      input: entry.input,
      similarity,
    });
  }  

  console.log(`Similarity of ${input} with:`);
  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity,
  );
  sortedSimilarities.forEach((similarity) => {
    console.log(`${similarity.input}: ${similarity.similarity}`);
  });
}

process.stdin.addListener("data", (input) => {
  searchMovies(input.toString());
});
