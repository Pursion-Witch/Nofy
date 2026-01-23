import { IncidentSeverity, Department } from "../types.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "DEEPSEEK_API_KEY missing from Vercel environment" });

  const { input, userRole, userDept, action } = req.body;

  try {
    let body: any = {};

    if (action === "processCommand") {
      body = {
        model: "deepseek-reasoner",
        messages: [
          { 
            role: "system", 
            content: `You are the NOFY Neural Relay. User: ${userRole} in ${userDept}. 
            Translate to aviation English. Respond ONLY in JSON.
            Structure: {"tool": "broadcastAlert" or "relayMessage", "parameters": {...}}` 
          },
          { role: "user", content: input }
        ],
        response_format: { type: "json_object" }
      };
    } else {
      body = {
        model: "deepseek-reasoner",
        messages: [{ role: "user", content: `Summarize: ${input}` }]
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

    // --- NEW ERROR CHECKING ---
    if (data.error) {
      console.error("DeepSeek API Error Detail:", data.error);
      return res.status(500).json({ 
        error: "DeepSeek API returned an error", 
        message: data.error.message 
      });
    }

    if (!data.choices || data.choices.length === 0) {
      console.error("Unexpected DeepSeek Response:", data);
      return res.status(500).json({ error: "DeepSeek returned no choices. Check balance or server status." });
    }
    // --------------------------

    const content = data.choices[0].message.content;

    if (action === "processCommand") {
      const parsed = JSON.parse(content);
      return res.json({
        text: data.choices[0].message.reasoning_content || "", // Shows R1's "thinking"
        toolCalls: [{
          name: parsed.tool,
          args: parsed.parameters
        }]
      });
    }

    return res.json({ text: content });

  } catch (err: any) {
    console.error("Server Crash:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
