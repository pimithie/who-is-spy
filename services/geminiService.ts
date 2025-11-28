import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { WordPair, GeminiWordResponse } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Fallback words in case API fails or key is invalid
const FALLBACK_WORDS: WordPair[] = [
  { civilianWord: "Milk", spyWord: "Soy Milk" },
  { civilianWord: "Pillow", spyWord: "Cushion" },
  { civilianWord: "Superman", spyWord: "Spider-man" },
  { civilianWord: "Apple", spyWord: "Pear" },
  { civilianWord: "Football", spyWord: "Basketball" },
];

export const generateWordPair = async (): Promise<WordPair> => {
  try {
    const ai = getClient();
    
    // JSON Schema for the response
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        civilianWord: {
          type: Type.STRING,
          description: "The word for the majority of players (Civilians). Must be a noun.",
        },
        spyWord: {
          type: Type.STRING,
          description: "The word for the spies. Must be very similar to the civilian word but distinctly different.",
        },
      },
      required: ["civilianWord", "spyWord"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a creative and challenging word pair for the game 'Who is the Spy' (谁是卧底). The words should be in Chinese (Simplified). The words should be related but distinct nouns. Do not use obscure words.",
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.9, // High creativity
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as GeminiWordResponse;
    return {
      civilianWord: data.civilianWord,
      spyWord: data.spyWord
    };

  } catch (error) {
    console.warn("Gemini generation failed, using fallback:", error);
    const randomFallback = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
    // Return a fallback but marked as such if needed, or just return it.
    // Ideally we would translate the fallback to Chinese if the prompt requested Chinese,
    // but for safety in this demo, let's use Chinese fallbacks.
    const chineseFallbacks = [
        { civilianWord: "牛奶", spyWord: "豆浆" },
        { civilianWord: "枕头", spyWord: "抱枕" },
        { civilianWord: "超人", spyWord: "蜘蛛侠" },
        { civilianWord: "苹果", spyWord: "梨" },
        { civilianWord: "足球", spyWord: "篮球" },
        { civilianWord: "麦当劳", spyWord: "肯德基" },
        { civilianWord: "微信", spyWord: "QQ" },
    ];
    return chineseFallbacks[Math.floor(Math.random() * chineseFallbacks.length)];
  }
};
