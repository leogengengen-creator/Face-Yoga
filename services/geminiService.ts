import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ideally handled via secure backend or build time env
const ai = new GoogleGenAI({ apiKey });

export const getDailyYogaTip = async (): Promise<string> => {
  if (!apiKey) return "Drink plenty of water today for glowing skin!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give me a very short, one-sentence motivational tip for face yoga or skin health. Keep it under 15 words.",
    });
    return response.text || "Smile, it's the best face yoga!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistency is the key to natural beauty.";
  }
};