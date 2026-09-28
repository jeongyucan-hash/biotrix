'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { requestSiteWork } from './actions';
import { sites } from '../../lib/sites/catalog';

export default function RequestForm({ selected }) {
  const [state, action, pending] = useActionState(requestSiteWork, null);
  return <form action={action} className="stackForm">
    <label>대상 사이트<select name="site" defaultValue={selected.id}>{sites.map(site => <option key={site.id} value={site.id}>{site.name} · {site.team}</option>)}</select></label>
    <label>업무명<input name="title" placeholder="예: 모바일 첫 화면 개선" required maxLength={160} /></label>
    <label>무엇을 바꾸면 좋을까요?<textarea name="objective" rows={4} defaultValue={selected.goal} required maxLength={6000} /></label>
    <label>완료 기준<textarea name="criteria" rows={3} defaultValue="모바일과 PC에서 확인하고, 변경 내용·검수 결과·실제 반영 주소를 보고해주세요." required maxLength={3000} /></label>
    <label>우선순위<select name="priority" defaultValue="medium"><option value="medium">보통</option><option value="high">높음</option><option value="urgent">긴급</option><option value="low">낮음</option></select></label>
    <button className="hqButton" disabled={pending || state?.ok} type="submit">{pending ? '접수 중…' : state?.ok ? '접수 완료' : 'HQ에 업무 맡기기'}</button>
    {state && <div role={state.ok ? 'status' : 'alert'}><p>{state.message}</p>{state.ok && <><Link href={`/work-queue#work-${state.id}`}>업무 상세 열기 →</Link><p><a href="/sites#request">다른 업무 등록</a></p></>}</div>}
  </form>;
}
