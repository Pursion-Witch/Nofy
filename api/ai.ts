import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API_KEY missing" });

  const { input } = req.body;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: input }] }],
      config: { systemInstruction: "You are an airport command AI." }
    });

    res.json({
      choices: [{ message: { content: response.text } }]
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "AI failure", details: err.message });
  }
}
