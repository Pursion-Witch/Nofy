
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
      message: { type: Type.STRING, description: "The core message describing the incident." },
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
      message: { type: Type.STRING, description: "The processed information payload." },
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
    return {
        text: "System Offline (No API Key). Simulated Routing: " + input,
        toolCalls: []
    };
  }

  const systemInstruction = `
    You are the "NOFY Relay Engine" for MCIA (Mactan-Cebu International Airport).
    You are an Intelligent Backend Logic Module. Your job is to classify inputs based on SEVERITY and route them to the correct SILOS (AOCC vs Terminal Ops).

    AOCC PROTOCOL: Handles aircraft, runways, emergency command, high-level resources.
    TERMINAL OPS PROTOCOL: Handles queues, facilities, passenger flow, initial security.

    STRICT SEVERITY & ROUTING LOGIC:

    1. **LOW SEVERITY** (Log & Track)
       - Scenario: Cosmetic/Maintenance (e.g., "Dirty washroom", "Flickering light", "No soap").
       - Action: Route to SAFETY_QUALITY (Janitorial) + TERMINAL_OPS.
       - Do NOT broadcast to AOCC urgent channels, just log it.

    2. **MEDIUM SEVERITY** (Monitor & Alert)
       - Scenario: Efficiency Dips.
       - TRIGGER: Queue times > 10 minutes (Check-in, Travel Tax). Conveyor jams.
       - Action: Route to TERMINAL_OPS (Supervisor).
       - Note: "Monitor CCTV".

    3. **URGENT SEVERITY** (Immediate Action / Pre-Incident)
       - Scenario: Passenger Distress or Pre-Security Risk.
       - TRIGGER: "Medical", "Fainting", "Vomiting" -> Action: Deploy Airport First Responder (Route to TERMINAL_OPS + SAFETY_QUALITY).
       - TRIGGER: "UV Discovery" (Unattended Baggage - Initial) -> Action: INITIATE PAGING PROTOCOL (3x). Route to SECURITY + TERMINAL_OPS.
       - TRIGGER: "Missed Flight Risk" -> Route to AIRLINE_MARKETING + TERMINAL_OPS.

    4. **CRITICAL SEVERITY** (Emergency Response)
       - Scenario: Threat to life, security breach, system failure.
       - TRIGGER: "UV Confirmed" (Unattended bag AFTER 3x pages) -> Action: Call PNP/K9. Route to SECURITY + AOCC.
       - TRIGGER: "Fire", "Smoke", "FOD" (Foreign Object Debris), "Runway Obstruction".
       - Action: TRIGGER INCIDENT COMMAND. Route to AOCC (Incident Commander) + SECURITY + SAFETY_QUALITY.

    ROUTING RULES:
    - **AOCC ALWAYS** receives a digital copy of every log, but only alert them via 'broadcastAlert' for CRITICAL issues.
    - For LOW/MEDIUM/URGENT, use 'relayMessage'.
    - If user asks to assign gates/stands, use 'allocateResource'.

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

    const text = response.text;
    const toolCalls = response.functionCalls || [];

    return { text, toolCalls };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
