import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API_KEY missing" });

  const { input } = req.body;
  const genAI = new GoogleGenAI({ apiKey: apiKey });

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are an airport command AI."
    });

    const result = await model.generateContent(input);
    const text = result.response.text();

    // Keeps the DeepSeek-style response format so your frontend works
    res.json({
      choices: [{ message: { content: text } }]
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "AI failure", details: err.message });
  }
}
