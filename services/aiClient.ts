export async function sendToAI(input: string, userRole: string, userDept: string) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, userRole, userDept })
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  return res.json();
}
