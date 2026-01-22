import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { IncidentSeverity, Department } from "../types.js";

// --- TOOLS (Restored exactly as your original) ---
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY missing" });
  }

  const { input, userRole, userDept, action } = req.body;

  // FIX: SDK expects an object { apiKey: string }
  const genAI = new GoogleGenAI({ apiKey: apiKey });

  try {
    if (action === "processCommand") {
      // FIX: Use getGenerativeModel and valid model names
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: `You are the "NOFY Neural Relay" for Mactan-Cebu International Airport. User Context: ${userRole} working in ${userDept}. Translate Cebuano/Tagalog to aviation English.`
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input }] }],
        tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool] }] as any,
      });

      return res.json({
        text: result.response.text() || "",
        toolCalls: result.response.functionCalls() || [],
      });
    }

    if (action === "summary") {
      const { type, loc, desc } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const response = await model.generateContent(`Incident Type: ${type}\nLocation: ${loc}\nDescription: ${desc}\n\nRules: Max 20 words, Professional aviation tone.`);
      return res.json({ text: response.response.text().trim() });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err: any) {
    console.error("Neural API failure:", err);
    return res.status(500).json({ error: "Neural Link Error", details: err.message });
  }
}import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { IncidentSeverity, Department } from "../types.js";

// --- TOOLS (Restored exactly as your original) ---
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY missing" });
  }

  const { input, userRole, userDept, action } = req.body;

  // FIX: SDK expects an object { apiKey: string }
  const genAI = new GoogleGenAI({ apiKey: apiKey });

  try {
    if (action === "processCommand") {
      // FIX: Use getGenerativeModel and valid model names
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: `You are the "NOFY Neural Relay" for Mactan-Cebu International Airport. User Context: ${userRole} working in ${userDept}. Translate Cebuano/Tagalog to aviation English.`
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input }] }],
        tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool] }] as any,
      });

      return res.json({
        text: result.response.text() || "",
        toolCalls: result.response.functionCalls() || [],
      });
    }

    if (action === "summary") {
      const { type, loc, desc } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const response = await model.generateContent(`Incident Type: ${type}\nLocation: ${loc}\nDescription: ${desc}\n\nRules: Max 20 words, Professional aviation tone.`);
      return res.json({ text: response.response.text().trim() });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err: any) {
    console.error("Neural API failure:", err);
    return res.status(500).json({ error: "Neural Link Error", details: err.message });
  }
}
