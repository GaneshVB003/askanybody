

import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateAiResponse = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    // Return a mock response if API key is not available
    return new Promise((resolve) =>
      setTimeout(() => resolve("This is a mock AI response. Please configure your Gemini API key."), 1000)
    );
  }

  try {
    // FIX: Use systemInstruction for persona and contents for the user prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant in a chat application. Keep your response concise and helpful.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error. Please try again later.";
  }
};
