
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Agency, IncidentSeverity, StrategicPillar, Department } from "./types";

// --- TOOLS ---

const broadcastAlertTool: FunctionDeclaration = {
  name: "broadcastAlert",
  description: "REQUIRED for RED or ORANGE tier incidents. Use for anything dangerous, urgent, or high-impact.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      severity: { 
        type: Type.STRING, 
        enum: Object.values(IncidentSeverity),
        description: "CRITICAL or URGENT for RED, HIGH for ORANGE."
      },
      translatedMessage: { type: Type.STRING, description: "The message strictly translated to professional aviation ENGLISH." },
      originalLanguage: { type: Type.STRING, description: "Detected source: e.g., 'Cebuano', 'Tagalog', 'English'." },
      intensityLevel: { 
        type: Type.STRING, 
        enum: ['RED', 'ORANGE'], 
        description: "RED: Life safety/Security/Fire. ORANGE: Major ops disruption/Equipment failure." 
      },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) } }
    },
    required: ["severity", "translatedMessage", "intensityLevel", "targetDepts"],
  },
};

const relayMessageTool: FunctionDeclaration = {
  name: "relayMessage",
  description: "REQUIRED for BLUE tier incidents. Use for standard updates, maintenance, or minor issues.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      translatedMessage: { type: Type.STRING, description: "The message strictly translated to professional aviation ENGLISH." },
      intensityLevel: { type: Type.STRING, enum: ['BLUE'], description: "Standard operational tier." },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) } }
    },
    required: ["translatedMessage", "intensityLevel", "targetDepts"]
  }
};

// --- MAIN PROCESSOR ---

export const processCommandInput = async (input: string, userRole: string, userDept: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Upgraded to Pro for more reliable trilingual translation and tool calling
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `
    You are the "NOFY Neural Relay" for Mactan-Cebu International Airport (MCIA).
    Your absolute priority is to take airport operational reports and process them into the command system.
    
    CORE RULES:
    1. DO NOT RESPOND WITH TEXT. You MUST call either 'broadcastAlert' or 'relayMessage'.
    2. TRANSLATION: You must translate Tagalog, Visayan (Cebuano), or informal English into formal, clear Aviation English.
    3. SEVERITY TO COLOR MAPPING:
       - RED (CRITICAL/URGENT): Fire (Sunog), Medical (Sakit), Bomb, Unattended Bag, Violence, Active Breach.
       - ORANGE (HIGH): Major Queues (>20m), Broken Equipment (PBB, Conveyor), Large Spill, Missing Staff.
       - BLUE (MEDIUM/LOW): General updates, routine checks, minor maintenance, shift reports.
    
    If the user input is in Visayan like "Naay gubot sa gate 5", you translate to "Disorderly conduct reported at Gate 5" and call 'broadcastAlert' with intensityLevel='RED'.
    
    User Context: ${userRole} working in ${userDept}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: input,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool] }],
        // Pro models benefit from a higher thinking budget for complex translation/classification
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    const toolCalls = response.functionCalls || [];
    const text = response.text || "";

    return { text, toolCalls };

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
