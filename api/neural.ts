import { IncidentSeverity, Department } from "../types.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const { input, userRole, userDept } = req.body;

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
            Translate Cebuano/Tagalog to Aviation English and AUTO-TAG the incident.

            CATEGORIES & SUBTAGS:
            - SECURITY: [Bomb Threat, Unattended Bag, Physical Altercation, Unauthorized Access, Theft, Breach]
            - MEDICAL: [Cardiac Arrest, Fainting, Injury, Respiratory, Infectious, Heatstroke]
            - FACILITIES: [Water Leak, Power Failure, AC Malfunction, Elevator Issue, Janitorial, Signage]
            - OPERATIONAL: [Flight Delay, Queue Congestion, Baggage Issue, VIP Movement]

            COLOR LOGIC (intensityLevel):
            - RED: Life-threatening / Emergency (Bomb, Fire, Cardiac Arrest, Breach).
            - ORANGE: High Priority / Disruptive (Unattended bag, Power fail, Injury, Fights).
            - BLUE: Routine / Maintenance (Janitorial, AC Issue, Minor Queue).

            JSON OUTPUT ONLY:
            {
              "tool": "broadcastAlert",
              "parameters": {
                "category": "SECURITY" | "MEDICAL" | "FACILITIES" | "OPERATIONAL",
                "subtag": "String from list above",
                "translatedMessage": "English translation",
                "intensityLevel": "RED" | "ORANGE" | "BLUE",
                "targetDepts": ["AOCC", "..."]
              }
            }`
          },
          { role: "user", content: `Input: "${input}"` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return res.json({
      toolCalls: [{
        name: parsed.tool,
        args: parsed.parameters
      }]
    });
  } catch (err) {
    return res.status(500).json({ error: "Neural Link Failure" });
  }
}
