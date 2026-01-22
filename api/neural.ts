import type { IncomingMessage, ServerResponse } from "any";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { IncidentSeverity, Department } from "../types";

// --- TOOLS ---
const broadcastAlertTool: FunctionDeclaration = {
  name: "broadcastAlert",
  description: "REQUIRED for RED or ORANGE tier incidents. Use for anything dangerous, urgent, or high-impact.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      severity: { type: Type.STRING, enum: Object.values(IncidentSeverity) },
      translatedMessage: { type: Type.STRING },
      originalLanguage: { type: Type.STRING },
      intensityLevel: { type: Type.STRING, enum: ["RED", "ORANGE"] },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) } },
    },
    required: ["severity", "translatedMessage", "intensityLevel", "targetDepts"],
  },
};

const relayMessageTool: FunctionDeclaration = {
  name: "relayMessage",
  description: "REQUIRED for BLUE tier incidents.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      translatedMessage: { type: Type.STRING },
      intensityLevel: { type: Type.STRING, enum: ["BLUE"] },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) } },
    },
    required: ["translatedMessage", "intensityLevel", "targetDepts"],
  },
};

// --- API HANDLER ---
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check API key exists
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Missing API_KEY environment variable");
    return res.status(500).json({ error: "Server configuration error: API_KEY missing" });
  }

  const { input, userRole, userDept, action } = req.body;

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (action === "processCommand") {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: input,
        config: {
          systemInstruction: `
You are the "NOFY Neural Relay" for Mactan-Cebu International Airport (MCIA).

Rules:
- DO NOT respond with text
- You MUST call broadcastAlert or relayMessage
- Translate Cebuano/Tagalog to aviation English

User Context: ${userRole} working in ${userDept}
`,
          tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool] }],
        },
      });

      return res.json({
        text: response.text ?? "",
        toolCalls: response.functionCalls ?? [],
      });
    }

    if (action === "summary") {
      const { type, loc, desc } = req.body;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
Incident Type: ${type}
Location: ${loc}
Description: ${desc}

Rules:
- Max 20 words
- Professional aviation tone
`,
      });

      return res.json({ text: response.text?.trim() ?? "" });
    }

    if (action === "uiConcept") {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: "Futuristic airport command center UI, dark mode, 4K" }] },
      });

      // Safe access to nested content
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p: any) => p.inlineData);
      const imageUrl = imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : "";

      return res.json({ imageUrl });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err: any) {
    console.error("Neural API failure:", err);
    return res.status(500).json({ error: "Neural Link Error", details: err.message });
  }
}
