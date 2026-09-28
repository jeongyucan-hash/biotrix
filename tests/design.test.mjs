import test from 'node:test';import assert from 'node:assert/strict';
import {validateDecision,validateRequest,resolveAsset} from '../lib/design/validation.mjs';
const form=o=>new Map(Object.entries(o));
test('decisions require rationale and respect length limits',()=>{assert.equal(validateDecision(form({title:'x',decision:'y'})),null);assert.equal(validateDecision(form({title:'x'.repeat(141),decision:'y',rationale:'z'})),null);assert.equal(validateDecision(form({title:' x ',decision:' y ',rationale:' z '})).title,'x');});
test('requests reject invalid priority and incomplete criteria',()=>{assert.equal(validateRequest(form({title:'x',objective:'y',criteria:'z',priority:'admin'})),null);assert.equal(validateRequest(form({title:'x',objective:'y'})),null);assert.equal(validateRequest(form({title:'x',objective:'y',criteria:'z'})).priority,'medium');});
test('file resolver denies traversal and unlisted files',()=>{const m={files:[{name:'master.pdf'}]};assert.equal(resolveAsset(m,'../master.pdf'),null);assert.equal(resolveAsset(m,'%2e%2e%2fmaster.pdf'),null);assert.equal(resolveAsset(m,'secrets.txt'),null);assert.equal(resolveAsset(m,'master.pdf').name,'master.pdf');});
