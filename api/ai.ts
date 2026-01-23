export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "DEEPSEEK_API_KEY missing" });

  const { input } = req.body;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [
          { role: "system", content: "You are an airport command AI. Provide concise, logical reasoning for your answers." },
          { role: "user", content: input }
        ]
      })
    });

    const data = await response.json();
    
    // DeepSeek-R1 returns the answer in 'content' 
    // and the thinking process in 'reasoning_content'
    res.json({
      choices: [{ 
        message: { 
          content: data.choices[0].message.content 
        } 
      }]
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "DeepSeek failure", details: err.message });
  }
}
