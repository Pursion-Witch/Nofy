import { IncidentSeverity, Department } from "../types.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "DEEPSEEK_API_KEY missing" });

  const { input, userRole, userDept, action } = req.body;

  try {
    let systemPrompt = "";
    let body: any = {};

    if (action === "processCommand") {
      systemPrompt = `You are the "NOFY Neural Relay" for Mactan-Cebu International Airport. 
      User: ${userRole} in ${userDept}. 
      Task: Translate input to aviation English.
      If the incident is RED/ORANGE (urgent/dangerous), you must respond in JSON format for a "broadcastAlert".
      If the incident is BLUE (standard), respond in JSON for a "relayMessage".
      
      JSON Structure:
      {
        "tool": "broadcastAlert" | "relayMessage",
        "parameters": { ... }
      }`;

      body = {
        model: "deepseek-reasoner",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input }
        ],
        response_format: { type: "json_object" }
      };
    } else if (action === "summary") {
      body = {
        model: "deepseek-reasoner",
        messages: [
          { role: "system", content: "Summarize the incident in max 20 words. Professional aviation tone." },
          { role: "user", content: `Type: ${req.body.type}, Location: ${req.body.loc}, Desc: ${req.body.desc}` }
        ]
      };
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (action === "processCommand") {
      const parsed = JSON.parse(content);
      return res.json({
        text: "", // R1's reasoning is hidden in the 'reasoning_content' field usually
        toolCalls: [{
          name: parsed.tool,
          args: parsed.parameters
        }]
      });
    }

    return res.json({ text: content });

  } catch (err: any) {
    console.error("DeepSeek Error:", err);
    return res.status(500).json({ error: "DeepSeek Link Error", details: err.message });
  }
}
