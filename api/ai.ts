export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const { input } = req.body;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Instant response
        messages: [
          { role: "system", content: "Concise Airport AI." },
          { role: "user", content: input }
        ],
        max_tokens: 100 
      })
    });

    const data = await response.json();
    res.json({
      choices: [{ message: { content: data.choices[0].message.content } }]
    });

  } catch (err: any) {
    res.status(500).json({ error: "AI Busy" });
  }
}
