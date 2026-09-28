import test from 'node:test';
import assert from 'node:assert/strict';
import {parseResearch,requestResearch,researchConfiguration,researchError} from '../lib/sourcing/research.mjs';
import {responseText,safeUrl} from '../lib/ai/responses.mjs';

const url='https://supplier.example/catalog';
const candidate={name:'공급처',source_url:url,summary:'공개 상품',terms:'문의 필요',unknowns:'공급가·재고 미확인'};
function fixture(candidates=[candidate]) {return {id:'resp_test',status:'completed',usage:{input_tokens:30,output_tokens:40},output:[
  {type:'web_search_call',status:'completed',action:{sources:[{url,title:'공식 상품목록'}]}},
  {type:'message',content:[{type:'output_text',text:JSON.stringify({summary:'조사 요약',limitations:'공개자료만 확인',candidates}),annotations:[{type:'url_citation',url,title:'공식 상품목록'}]}]},
]};}
test('raw REST output is parsed, references deduplicate, supplier claims stay separate',()=>{
  const r=parseResearch(fixture());assert.equal(r.candidates.length,1);assert.equal(r.sources.length,1);
  assert.equal(r.candidates[0].unknowns,'공급가·재고 미확인');assert.ok(responseText(fixture()));
});
test('fabricated, unsafe and duplicate source URLs cannot become candidates',()=>{
  const r=parseResearch(fixture([candidate,candidate,{...candidate,source_url:'https://invented.example/'},{...candidate,source_url:'javascript:alert(1)'}]));
  assert.equal(r.candidates.length,1);assert.equal(r.rejected,3);assert.equal(safeUrl('javascript:alert(1)'),null);
});
test('no actual search, missing evidence, refusal, malformed and incomplete responses fail closed',()=>{
  const noSearch=fixture();noSearch.output.shift();assert.throws(()=>parseResearch(noSearch),/search_not_executed/);
  const noSources=fixture();noSources.output[0].action.sources=[];noSources.output[1].content[0].annotations=[];assert.throws(()=>parseResearch(noSources),/sources_missing/);
  const bad=fixture();bad.output[1].content[0].text='not json';assert.throws(()=>parseResearch(bad),/invalid_research_json/);
  const refusal=fixture();refusal.output[1].content=[{type:'refusal',refusal:'cannot comply'}];assert.throws(()=>parseResearch(refusal),/invalid_research_json/);
  assert.throws(()=>parseResearch({...fixture(),status:'incomplete'}),/incomplete_response/);
});
test('missing authentication never sends a model request',async()=>{
  let calls=0;await assert.rejects(requestResearch('test',{env:{},fetchImpl:async()=>{calls++;}}),/missing_auth/);
  assert.equal(calls,0);assert.equal(researchConfiguration({}).configured,false);
});
test('one bounded GPT search request, no paid automatic retry; safe error messages',async()=>{
  let calls=0;
  const response=await requestResearch('공급처 조사',{env:{AI_GATEWAY_API_KEY:'test-only'},fetchImpl:async(endpoint,options)=>{
    calls++;assert.equal(endpoint,'https://ai-gateway.vercel.sh/v1/responses');
    const body=JSON.parse(options.body);assert.equal(body.model,'openai/gpt-5.4-mini');assert.equal(body.max_tool_calls,3);
    assert.equal(body.max_output_tokens,5000);assert.equal(body.tools[0].type,'web_search');
    return {ok:true,json:async()=>fixture()};
  }});
  assert.equal(calls,1);assert.equal(parseResearch(response).candidates.length,1);
  await assert.rejects(requestResearch('test',{env:{VERCEL_OIDC_TOKEN:'test-only'},fetchImpl:async()=>({ok:false,status:402})}),/provider_402/);
  assert.match(researchError(new Error('provider_402')),/잔액/);
  assert.ok(!researchError(new Error('secret test-only')).includes('test-only'));
});
