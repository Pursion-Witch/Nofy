
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Agency, IncidentSeverity, StrategicPillar, Department } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- TOOLS ---

const broadcastAlertTool: FunctionDeclaration = {
  name: "broadcastAlert",
  description: "Broadcasts a CRITICAL or HIGH severity incident/emergency. AUTOMATICALLY includes AOCC.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      severity: { type: Type.STRING, enum: Object.values(IncidentSeverity) },
      message: { type: Type.STRING, description: "The core message in ENGLISH (Translated from input)." },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) }, description: "Departments that need to respond." },
      agencies: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Agency) } },
      impactedPillar: { type: Type.STRING, enum: Object.values(StrategicPillar), description: "If this affects a strategic project." }
    },
    required: ["severity", "message", "targetDepts"],
  },
};

const relayMessageTool: FunctionDeclaration = {
  name: "relayMessage",
  description: "Routes operational information to specific departments based on the Knowledge Base. AOCC is ALWAYS a recipient.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING, description: "The processed information payload in ENGLISH (Translated from input)." },
      targetDepts: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(Department) }, description: "Specific departments that handle this type of issue." },
      priority: { type: Type.STRING, enum: ['STANDARD', 'URGENT'], description: "Urgency of the message." }
    },
    required: ["message", "targetDepts"]
  }
};

const allocateResourceTool: FunctionDeclaration = {
  name: "allocateResource",
  description: "AOCC ONLY: Assigns airport resources (Check-in, Carousels, Gates) to flights or airlines.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      resourceType: { type: Type.STRING, enum: ['CHECK_IN', 'CAROUSEL', 'GATE', 'PARKING_STAND'] },
      identifier: { type: Type.STRING, description: "The ID of the resource (e.g., 'Carousel 5', 'Stand 12')" },
      assignedTo: { type: Type.STRING, description: "Flight number or Airline" },
      action: { type: Type.STRING, enum: ['ASSIGN', 'RELEASE', 'MAINTENANCE'] }
    },
    required: ["resourceType", "identifier", "action"],
  },
};

const accessPassengerRecordTool: FunctionDeclaration = {
  name: "accessPassengerRecord",
  description: "Retrieves sensitive passenger info. Requires AOCC + Security clearance.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      passengerName: { type: Type.STRING },
      category: { type: Type.STRING, enum: ['MEDICAL', 'OFW', 'SECURITY', 'VIP'] },
      reason: { type: Type.STRING }
    },
    required: ["passengerName", "category", "reason"],
  },
};

// --- MAIN PROCESSOR ---

export const processCommandInput = async (input: string, userRole: string, userDept: string) => {
  if (!apiKey) {
    // Fallback simulation if no API key
    return {
        text: `[SYSTEM OFFLINE] ${input}`,
        toolCalls: []
    };
  }

  const systemInstruction = `
    You are the "NOFY Relay Engine" for MCIA (Mactan-Cebu International Airport).
    
    PRIMARY OBJECTIVE: TRANSLATION & LOGGING
    1. RECEIVE input in English, Tagalog (Filipino), or Visayan (Cebuano).
    2. TRANSLATE the input to professional ENGLISH.
    3. CALL the appropriate tool ('broadcastAlert' or 'relayMessage') with the TRANSLATED message.
    
    SEVERITY DETECTION & TOOLS:
    - DETECT SEVERITY based on keywords:
      * CRITICAL: Fire (Sunog), Bomb, Terror, Active Shooter.
      * URGENT: Medical (Sakit/Kuyap), Missing Child.
      * HIGH: Fight (Gubot/Suntukan), Theft (Kawat/Nakaw).
      * LOW/MEDIUM: Maintenance, Delays, Queues.
    
    - CALL 'broadcastAlert' for CRITICAL/HIGH/URGENT.
    - CALL 'relayMessage' for LOW/MEDIUM.
    - IMPORTANT: The 'message' argument in the tool call MUST be the English translation.
    
    INPUT CONTEXT: User is ${userRole} from ${userDept}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: input,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool, allocateResourceTool, accessPassengerRecordTool] }],
      }
    });

    const text = response.text || ""; 
    const toolCalls = response.functionCalls || [];

    return { text, toolCalls };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "AI Service Unavailable: " + input, toolCalls: [] };
  }
};
