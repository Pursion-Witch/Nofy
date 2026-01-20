import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Agency, IncidentSeverity, StrategicPillar, Department } from "./types";

// --- TOOLS ---

const broadcastAlertTool: FunctionDeclaration = {
  name: "broadcastAlert",
  description: "Broadcasts a CRITICAL, URGENT, or HIGH severity incident. RED or ORANGE alert.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      severity: { type: Type.STRING, enum: Object.values(IncidentSeverity) },
      translatedMessage: { type: Type.STRING, description: "The message translated to professional ENGLISH." },
      originalLanguage: { type: Type.STRING, description: "The detected source language (Tagalog, Visayan, etc)." },
      intensityLevel: { type: Type.STRING, enum: ['RED', 'ORANGE'], description: "RED for Critical/Urgent, ORANGE for High." },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) } }
    },
    required: ["severity", "translatedMessage", "intensityLevel", "targetDepts"],
  },
};

const relayMessageTool: FunctionDeclaration = {
  name: "relayMessage",
  description: "Routes standard operational info. BLUE alert tier.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      translatedMessage: { type: Type.STRING, description: "The message translated to professional ENGLISH." },
      intensityLevel: { type: Type.STRING, enum: ['BLUE'], description: "Standard operational tier." },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) } }
    },
    required: ["translatedMessage", "intensityLevel", "targetDepts"]
  }
};

// --- MAIN PROCESSOR ---

export const processCommandInput = async (input: string, userRole: string, userDept: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const systemInstruction = `
    You are the "NOFY Neural Relay" for Mactan-Cebu International Airport (MCIA).
    
    TASK:
    1. SOURCE: Input is in Tagalog, Visayan (Cebuano), or English.
    2. TRANSLATION: Always translate to formal aviation-standard ENGLISH.
    3. SEVERITY MAPPING:
       - RED (CRITICAL/URGENT): Fire, Medical Emergency, Bomb Threat, Unattended Bag, Active Fight.
       - ORANGE (HIGH): Major Queue (>20 mins), Equipment Failure (PBB/Conveyor), Security Breach (Non-violent).
       - BLUE (MEDIUM/LOW): Routine maintenance, general queries, minor spills, staff check-ins.
    
    4. RESPONSE: Call 'broadcastAlert' for RED/ORANGE or 'relayMessage' for BLUE.
    
    User Context: ${userRole} in ${userDept}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool] }],
      }
    });

    const toolCalls = response.functionCalls || [];
    return { 
      text: response.text || "", 
      toolCalls 
    };

  } catch (error) {
    console.error("Gemini Engine Failure:", error);
    return { text: "Neural Link Error. Reverting to manual log.", toolCalls: [] };
  }
};

export const generateUIConcept = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Futuristic airport command center UI, dark mode, glowing red and indigo data streams, high-resolution dashboard, 4K render.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    let imageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
    return imageUrl;
  } catch (e) { throw e; }
};
