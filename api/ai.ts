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
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are an MCIA Airport Assistant. Be extremely concise." },
          { role: "user", content: input }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    res.json({
      choices: [{ message: { content: data.choices[0].message.content } }]
    });
  } catch (err: any) {
    res.status(500).json({ error: "AI failure" });
  }
}
