import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash",
      contents: "Hello world",
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore"
            }
          }
        }
      }
    });
    console.log("Success:", !!response);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
