const MODELS_URL = 'https://ai-gateway.vercel.sh/v1/models';
const pricingCache = new Map();

export function estimateTokenCost(pricing, usage) {
  const inputTokens = usage?.input_tokens;
  const outputTokens = usage?.output_tokens;
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 ||
      !Number.isSafeInteger(outputTokens) || outputTokens < 0)
    return {estimatedCostUsd:null, costReason:'token_usage_unavailable'};
  if (!pricing) return {estimatedCostUsd:null, costReason:'model_pricing_unavailable'};
  const input = Number(pricing.input);
  const output = Number(pricing.output);
  if (!Number.isFinite(input) || input < 0 || !Number.isFinite(output) || output < 0 ||
      pricing.input == null || pricing.output == null)
    return {estimatedCostUsd:null, costReason:'model_pricing_incomplete'};
  return {estimatedCostUsd:inputTokens * input + outputTokens * output, costReason:null};
}

export async function estimateGatewayCost(model, usage, {fetchImpl=fetch}={}) {
  if (!model) return {estimatedCostUsd:null,costReason:'model_unavailable'};
  if (!Number.isSafeInteger(usage?.input_tokens) || !Number.isSafeInteger(usage?.output_tokens))
    return estimateTokenCost(null,usage);
  if (!pricingCache.has(model)) {
    try {
      const response=await fetchImpl(MODELS_URL,{cache:'no-store',signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('catalog_failed');
      const json=await response.json();
      const pricing=(json.data || []).find(item=>item.id===model)?.pricing || null;
      if (pricing) pricingCache.set(model,pricing); // Retry transient failures or missing models later.
      return estimateTokenCost(pricing,usage);
    } catch { return {estimatedCostUsd:null,costReason:'model_catalog_unavailable'}; }
  }
  return estimateTokenCost(pricingCache.get(model),usage);
}
