import { responseText } from './responses.mjs';
import { estimateGatewayCost } from './pricing.mjs';
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";

function getGatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "";
}

export async function callStructuredModel({
  model,
  schemaName,
  schema,
  system,
  prompt,
}) {
  const token = getGatewayToken();
  if (!token) {
    throw new Error("AI Gateway authentication is not available.");
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: system,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI Gateway ${response.status}: ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const rawText = responseText(json);

  if (!rawText) {
    throw new Error("AI Gateway returned no output_text.");
  }

  let object;
  try {
    object = JSON.parse(rawText);
  } catch {
    throw new Error("AI Gateway returned invalid structured JSON.");
  }

  const inputTokens = Number(json.usage?.input_tokens || 0);
  const outputTokens = Number(json.usage?.output_tokens || 0);
  const {estimatedCostUsd,costReason} = await estimateGatewayCost(model,json.usage);

  return {
    object,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
    costReason,
    model,
  };
}
