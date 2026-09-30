const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export async function callNvidiaChat({
  messages,
  model = process.env.NVIDIA_NIM_MODEL || "openai/gpt-oss-20b",
  temperature = 0.4,
  maxTokens = 2048,
}) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not configured");

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`NVIDIA NIM request failed (${response.status}): ${detail.slice(0, 500)}`);
  }
  return response.json();
}
