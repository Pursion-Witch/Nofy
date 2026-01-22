import { GoogleGenAI, Type, SchemaType } from "@google/genai"; // Changed Type import
import { IncidentSeverity, Department } from "../types.js";

// --- TOOLS ---
const broadcastAlertTool = {
  name: "broadcastAlert",
  description: "REQUIRED for RED or ORANGE tier incidents.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      severity: { type: SchemaType.STRING, enum: Object.values(IncidentSeverity) },
      translatedMessage: { type: SchemaType.STRING },
      originalLanguage: { type: SchemaType.STRING },
      intensityLevel: { type: SchemaType.STRING, enum: ["RED", "ORANGE"] },
      targetDepts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING, enum: Object.values(Department) } },
    },
    required: ["severity", "translatedMessage", "intensityLevel", "targetDepts"],
  },
};

const relayMessageTool = {
  name: "relayMessage",
  description: "REQUIRED for BLUE tier incidents.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      translatedMessage: { type: SchemaType.STRING },
      intensityLevel: { type: SchemaType.STRING, enum: ["BLUE"] },
      targetDepts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING, enum: Object.values(Department) } },
    },
    required: ["translatedMessage", "intensityLevel", "targetDepts"],
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API_KEY missing" });

  const { input, userRole, userDept, action } = req.body;
  const genAI = new GoogleGenAI(apiKey);

  try {
    if (action === "processCommand") {
      // Use 1.5 Pro for complex Tool Calling
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: `You are the "NOFY Neural Relay" for Mactan-Cebu International Airport. User: ${userRole} in ${userDept}. Translate Cebuano/Tagalog to aviation English. Call tools.`
      }, { tools: [{ functionDeclarations: [broadcastAlertTool, relayMessageTool] }] });

      const result = await model.generateContent(input);
      const response = result.response;

      return res.json({
        text: response.text() || "",
        toolCalls: response.functionCalls() || [],
      });
    }

    if (action === "summary") {
      // Use 1.5 Flash for fast summaries
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Summarize incident: ${req.body.type} at ${req.body.loc}. Desc: ${req.body.desc}. Max 20 words.`;
      
      const result = await model.generateContent(prompt);
      return res.json({ text: result.response.text().trim() });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err: any) {
    console.error("Neural Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
