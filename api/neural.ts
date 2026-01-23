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
        model: "deepseek-chat", // FAST MODEL: No "thinking" delay
        messages: [
          { 
            role: "system", 
            content: `Airport AI. User: ${userRole}/${userDept}. Translate to aviation English. JSON ONLY: {"tool":"broadcastAlert"|"relayMessage","parameters":{"message":"..."}}` 
          },
          { role: "user", content: input }
        ],
        response_format: { type: "json_object" },
        max_tokens: 150 // Limits response size for slow signals
      })
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return res.json({
      text: "", 
      toolCalls: [{ name: parsed.tool, args: parsed.parameters }]
    });

  } catch (err: any) {
    return res.status(500).json({ error: "Link Slow" });
  }
}
