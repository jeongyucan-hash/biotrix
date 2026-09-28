import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveGatewayCredentials} from '../lib/ai/gateway-auth-options.mjs';
import {researchConfiguration} from '../lib/sourcing/research.mjs';
test('production request token works without environment token',()=>{
  const credentials=resolveGatewayCredentials({VERCEL:'1'},new Headers({'x-vercel-oidc-token':'test-placeholder'}));
  assert.equal(researchConfiguration(credentials).configured,true);
  assert.equal(credentials.VERCEL_OIDC_TOKEN,'test-placeholder');
});
test('ignore incoming OIDC outside Vercel and retain API-key fallback',()=>{
  assert.equal(researchConfiguration(resolveGatewayCredentials({},new Headers({'x-vercel-oidc-token':'test-placeholder'}))).configured,false);
  assert.equal(researchConfiguration(resolveGatewayCredentials({AI_GATEWAY_API_KEY:'test-placeholder'},new Headers())).configured,true);
});
