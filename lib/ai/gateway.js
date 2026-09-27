const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const MODELS_URL = "https://ai-gateway.vercel.sh/v1/models";

const pricingCache = new Map();

function getGatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "";
}

async function getPricing(model) {
  if (pricingCache.has(model)) return pricingCache.get(model);

  try {
    const response = await fetch(MODELS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("model_catalog_failed");
    const json = await response.json();
    const match = (json.data || []).find((item) => item.id === model);
    const pricing = match?.pricing || null;
    pricingCache.set(model, pricing);
    return pricing;
  } catch {
    pricingCache.set(model, null);
    return null;
  }
}

function calculateCost(pricing, inputTokens, outputTokens) {
  if (!pricing) return 0;
  const input = Number(pricing.input || 0);
  const output = Number(pricing.output || 0);
  return (Number(inputTokens || 0) * input) + (Number(outputTokens || 0) * output);
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
  const rawText = json.output_text;

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
  const pricing = await getPricing(model);
  const estimatedCostUsd = calculateCost(pricing, inputTokens, outputTokens);

  return {
    object,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
    model,
  };
}
