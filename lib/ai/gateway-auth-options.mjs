export function resolveGatewayCredentials(env,incoming) {
  return {
    AI_GATEWAY_API_KEY:env.AI_GATEWAY_API_KEY,
    VERCEL_OIDC_TOKEN:env.VERCEL==='1'
      ? incoming.get('x-vercel-oidc-token') || env.VERCEL_OIDC_TOKEN
      : env.VERCEL_OIDC_TOKEN,
  };
}
