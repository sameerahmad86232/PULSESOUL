
import { GoogleGenAI, Type as GeminiType, Chat, Modality } from "@google/genai";
import type { StoryPage, VoiceOption } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

export const generateStory = async (prompt: string): Promise<StoryPage[]> => {
  const fullPrompt = `You are a magical storyteller for 5-year-old children. Create a short, happy story based on this theme: "${prompt}". The story should be exactly 5 pages long. For each page, provide the story text and a simple, clear visual prompt for an image generator to create an illustration. Respond with ONLY a JSON object containing a "story" key, which is an array of objects. Each object in the array should have three keys: "page" (page number starting from 1), "text" (the story paragraph for that page), and "imagePrompt" (a visual description for that page's illustration, like 'A small, cute, green dragon looking sadly at the sky').`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: GeminiType.OBJECT,
        properties: {
          story: {
            type: GeminiType.ARRAY,
            items: {
              type: GeminiType.OBJECT,
              properties: {
                page: { type: GeminiType.NUMBER },
                text: { type: GeminiType.STRING },
                imagePrompt: { type: GeminiType.STRING },
              },
              required: ["page", "text", "imagePrompt"],
            },
          },
        },
        required: ["story"],
      },
    },
  });

  let jsonStr = response.text.trim();
  const parsedResponse = JSON.parse(jsonStr);
  return parsedResponse.story;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A vibrant, colorful, and cute illustration for a children's storybook. Style: whimsical and friendly. Subject: ${prompt}`,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }
  
  throw new Error("No image data returned from API.");
};

export const generateSpeech = async (text: string, voice: VoiceOption): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a warm, gentle, and slightly cheerful voice: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data returned from API.");
    }
    return base64Audio;
};

export const continueChat = async (chatSession: Chat, message: string): Promise<string> => {
    const response = await chatSession.sendMessage({ message });
    return response.text;
};
