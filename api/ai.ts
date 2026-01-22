import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_KEY; // Using your Google Key
  if (!apiKey) return res.status(500).json({ error: "API_KEY missing" });

  const { input } = req.body;
  const genAI = new GoogleGenAI(apiKey);

  try {
    // Use 1.5 Flash (very fast and cheap)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are an airport command AI. Be concise and professional."
    });

    const result = await model.generateContent(input);
    const text = result.response.text();

    // Returning format similar to what your frontend expects
    res.json({ 
      choices: [{ message: { content: text } }] 
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Gemini AI failure", details: err.message });
  }
}
