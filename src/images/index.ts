import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { createReadStream, writeFileSync } from "fs";

const openai = new OpenAI();

async function generateImageUrlFormat() {
  const respose = await openai.images.generate({
    model: "dall-e-2",
    prompt: "The Greates Enemy of the Middle Earth, Morgoth",
    size: "256x256",
    n: 1,
  });
  console.log(respose.data![0].url);
}

async function generateImageBase64Format() {
  const respose = await openai.images.generate({
    model: "dall-e-2",
    prompt: "Generate image of Dark Lord Sauron from The Lord of the Rings",
    size: "256x256",
    n: 1,
    response_format: "b64_json",
  });
  const base64Image = respose.data![0].b64_json;
  if (base64Image) {
    const buffer = Buffer.from(base64Image, "base64");
    writeFileSync("dark_lord_sauron.png", buffer);
  }
}

async function generateImageVariationBase64Format() {
  await sharp("sauron.png").ensureAlpha().toFile("sauron_rgba.png");
  const image = await toFile(createReadStream("sauron_rgba.png"), "sauron_rgba.png", {
    type: "image/png",
  });

  const response = await openai.images.edit({
    model: "dall-e-2",
    image,
    prompt: "add chair to the image",
    response_format: "b64_json",
  });

  const base64Image = response.data![0].b64_json;
  if (base64Image) {
    const buffer = Buffer.from(base64Image, "base64");
    writeFileSync("sauron_variation.png", buffer);
  }
}

generateImageVariationBase64Format();
