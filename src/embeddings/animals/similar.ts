import { cosineSimilarity } from "../../utils";
import { DataWithEmbeddings, generateEmbeddings, loadJSONData } from "./index";

async function main() {
    const dataWithEmbeddings = loadJSONData<DataWithEmbeddings[]>('dataWithEmbeddings.json')

    const input = 'Animal';

    const inputEmbedding = await generateEmbeddings(input);

    const similarities: {
        input: string,
        similarity: number
    }[] = [];

    for (const entry of dataWithEmbeddings) {
        const similarity = cosineSimilarity(
            entry.embedding,
            inputEmbedding.data[0].embedding
        )
        similarities.push({
            input: entry.input,
            similarity
        })
    }

    console.log(`Similarity of ${input} with:`)
    const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);
    sortedSimilarities.forEach(similarity => {
        console.log(`${similarity.input}: ${similarity.similarity}`);
    })
}

main()