import test from 'node:test';
import assert from 'node:assert/strict';
import {collectCommits,commitRecord,recordId} from '../lib/work-history.mjs';
const sha='a'.repeat(40);
const commit={sha,commit:{message:'Fix navigation\n\nVerified links.',committer:{date:'2026-09-28T02:00:00Z'},author:{date:'2026-09-28T01:59:00Z'}}};
const response=(rows,link='')=>({ok:true,status:200,json:async()=>rows,headers:new Headers({link})});
test('all branches are read, paginated commits are deduplicated',async()=>{
  const urls=[];
  const result=await collectCommits(async url=>{
    urls.push(url);
    if(url.includes('/branches?'))return response([{name:'main'},{name:'design/real-photography'}]);
    if(new URL(url).searchParams.get('sha')==='main'&&new URL(url).searchParams.get('page')==='1')return response([commit],'<next>; rel="next"');
    return response([commit]);
  });
  assert.equal(result.commits.length,1);assert.equal(urls.length,4);
  assert.deepEqual([...new Set(result.commits[0].branches)],['main','design/real-photography']);
  assert.match(urls[3],/sha=design%2Freal-photography/);
});
test('record ids are stable across retries and branches',()=>{
  const a=commitRecord({...commit,branches:['main']});
  const b=commitRecord({...commit,branches:['design']});
  assert.equal(a.id,b.id);assert.notEqual(recordId('x'),recordId('y'));
  assert.equal(a.output_json.commit_url,`https://github.com/jeongyucan-hash/biotrix/commit/${sha}`);
  assert.equal(a.status,'recorded');
});
test('rate limit and malformed responses do not look like successful empty history',async()=>{
  await assert.rejects(collectCommits(async()=>({ok:false,status:403})),/한도/);
  let n=0;await assert.rejects(collectCommits(async()=>response(n++?[{sha:'bad'}]:[{name:'main'}])),/필수 정보/);
});
