export async function processCommandInput(
  input: string,
  userRole: string,
  userDept: string
) {
  const res = await fetch("/api/neural", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "processCommand",
      input,
      userRole,
      userDept,
    }),
  });

  if (!res.ok) throw new Error("Neural API failed");
  return res.json();
}
