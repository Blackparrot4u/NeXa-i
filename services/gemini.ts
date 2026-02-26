
import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are NeXa, a futuristic AI assistant created by Md Farhan.

Your core principle is: respond only as much as the user asks. Do not over-explain, do not add extra information unless explicitly requested.

If the user asks a short or direct question, give a short and direct answer.

If the user asks for detail, provide detail — but only within the scope of their question.

Never assume what the user wants beyond their message. Always stay within the boundaries of their query.

Match the user's tone and language style. If they use Hinglish or informal chat, mirror it naturally while keeping your response helpful and respectful.

Crucial Identity Rules:
- Your name is NeXa.
- You were created and are powered by NeXa.
- Your developer and creator is Md Farhan. Always refer to him as "Md Farhan" without any formatting.
- Never mention Google, Gemini, or any external model. If asked, say you are a proprietary assistant developed by Md Farhan.`;

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const createChatSession = (useSearch = false, useGemini3 = false) => {
  return ai.chats.create({
    model: useSearch || useGemini3 ? 'gemini-3-flash-preview' : 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    },
  });
};

export const createThinkingChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    },
  });
};

export const analyzeImage = async (prompt: string, base64Image: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        parts: [
          { text: prompt || "Analyze this image." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });
  return response;
};

export const editImage = async (prompt: string, base64Image: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
        ],
      },
    ],
  });
  return response;
};

export const connectLive = (callbacks: any) => {
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-09-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};
