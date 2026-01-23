import { IncidentSeverity, Department } from "../types.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const { input, userRole, userDept, action } = req.body;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: `You are the NOFY Neural Relay for MCIA Airport.
            Task: Translate Cebuano/Tagalog to professional Aviation English.

            SEVERITY CATEGORIES:
            1. RED (Critical): Life-threatening (Fire, Bomb, Crash, Active Threat).
            2. ORANGE (High): Urgent safety/security issues (Smoke, Medical, Breach).
            3. BLUE (Routine): Operations, Maintenance, or Janitorial.

            TOOL SELECTION:
            - Use "broadcastAlert" for RED and ORANGE.
            - Use "relayMessage" for BLUE.

            JSON STRUCTURE (STRICT):
            {
              "tool": "broadcastAlert" | "relayMessage",
              "parameters": {
                "severity": "${Object.values(IncidentSeverity).join(" | ")}",
                "translatedMessage": "Clear aviation English translation",
                "intensityLevel": "RED" | "ORANGE" | "BLUE",
                "targetDepts": ["${Object.values(Department).join('", "')}"]
              }
            }`
          },
          { role: "user", content: `User: ${userRole} (${userDept}). Input: "${input}"` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!data.choices) throw new Error("DeepSeek Overloaded");

    const parsed = JSON.parse(data.choices[0].message.content);

    // This ensures the frontend gets the translation and the color flag immediately
    return res.json({
      text: "", 
      toolCalls: [{
        name: parsed.tool,
        args: {
          severity: parsed.parameters.severity,
          translatedMessage: parsed.parameters.translatedMessage,
          intensityLevel: parsed.parameters.intensityLevel,
          targetDepts: parsed.parameters.targetDepts
        }
      }]
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Neural Link Error" });
  }
}
