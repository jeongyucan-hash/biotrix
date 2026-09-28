import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateTokenCost,estimateGatewayCost} from '../lib/ai/pricing.mjs';
import {costLabel,recentCost} from '../lib/sourcing/cost.mjs';

test('catalog prices are per token and persisted cost uses observed usage',async()=>{
  const cost=await estimateGatewayCost('openai/test',{input_tokens:9114,output_tokens:1402},{fetchImpl:async()=>({
    ok:true,json:async()=>({data:[{id:'openai/test',pricing:{input:0.000001,output:0.000004}}]})
  })});
  assert.ok(Math.abs(cost.estimatedCostUsd-0.014722)<1e-12);
  assert.equal(cost.costReason,null);
});
test('missing and incomplete pricing never become a zero-dollar estimate',async()=>{
  assert.deepEqual(estimateTokenCost(null,{input_tokens:9114,output_tokens:1402}),
    {estimatedCostUsd:null,costReason:'model_pricing_unavailable'});
  assert.equal(estimateTokenCost({input:0.1},{input_tokens:1,output_tokens:2}).costReason,'model_pricing_incomplete');
  assert.equal(estimateTokenCost({input:0,output:0},{input_tokens:0,output_tokens:0}).estimatedCostUsd,0);
  assert.equal((await estimateGatewayCost('openai/unlisted',{input_tokens:1,output_tokens:2},
    {fetchImpl:async()=>{throw Error('offline')}})).costReason,'model_catalog_unavailable');
  assert.equal((await estimateGatewayCost('openai/test',{input_tokens:1},
    {fetchImpl:async()=>{throw Error('should not fetch')}})).costReason,'token_usage_unavailable');
});
test('recent aggregate includes priced and unpriced calls without representing partial sum as total',()=>{
  const now=Date.parse('2026-09-28T10:00:00Z');
  const jobs=[{started_at:'2026-09-28T09:00:00Z',calls_used:1,estimated_cost_usd:'0.014722'},
    {started_at:'2026-09-28T08:00:00Z',calls_used:1,estimated_cost_usd:null,cost_reason:'model_catalog_unavailable'},
    {started_at:'2026-09-26T08:00:00Z',calls_used:1,estimated_cost_usd:'20'}];
  assert.deepEqual(recentCost(jobs,now),{known:0.014722,unknown:1,count:2});
  assert.match(costLabel(jobs[1]),/가격 목록 조회 실패/);
});
