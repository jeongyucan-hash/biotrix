import test from 'node:test';
import assert from 'node:assert/strict';
import {quickMission} from '../lib/sourcing/intake.mjs';
test('one sentence becomes a mission without invented price or margin',()=>{
  const m=quickMission('  쿠팡 건강기능식품 공급처를 찾아줘  ');
  assert.equal(m.brief,'쿠팡 건강기능식품 공급처를 찾아줘');
  assert.deepEqual(m.target_channels,['쿠팡']);assert.equal(m.max_initial_cash,1000000);
  assert.equal(m.target_retail_price,undefined);assert.equal(m.target_gross_margin_pct,undefined);
});
test('invalid or oversized requests rejected',()=>{
  for(const value of ['',null,'안녕','a'.repeat(3001)]) assert.throws(()=>quickMission(value));
  assert.equal(quickMission('a'.repeat(3000)).title.length,80);
});
