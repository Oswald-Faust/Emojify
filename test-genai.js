import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API KEY");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName) {
  console.log(`Testing ${modelName}...`);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: "Hello" }] },
    });
    console.log(`${modelName} Success:`, response.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 20));
  } catch (e) {
    console.error(`${modelName} Error:`, e.message);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-pro');
  await testModel('gemini-2.0-flash-exp');
}

run();
