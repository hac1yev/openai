import { Pinecone } from '@pinecone-database/pinecone';
import { generateNumberArray } from '../utils';

interface CoolType {
    [key: string]: string | number;
}

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

async function createIndex() {
    await pc.createIndex({
        name: 'cool-index',
        dimension: 1536,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    })
}

async function listIndexes() {
    const result = await pc.listIndexes();
    console.log(result);
}

function getIndex() {
    const index = pc.index<CoolType>({ name: 'cool-index' });
    return index;
}

async function createNamespace() {
    const index = getIndex();
    const namespace = index.namespace('cool-namespace');
}

async function upsertVectors() {
    const embedding = generateNumberArray(1536);
    const index = getIndex();
    
    const upsertResult = await index.upsert({
        records: [
            {
                id: 'id-1',
                values: embedding,
                metadata: {
                    coolness: 3,
                    reference: 'abcd'
                }
            }
        ]
    })
}

async function queryVectors() {
    const index = getIndex();
    const result = await index.query({
        id: 'id-1',
        topK: 1,
        includeMetadata: true
    })

    console.log(result);
    
}

async function main() {
    queryVectors()
}

main();