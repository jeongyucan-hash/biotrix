'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { requestDesignWork, recordDesignDecision } from './actions';
function Status({state}) {return state && <div role={state.ok?'status':'alert'}><p>{state.message}</p>{state.id && <Link href={`/work-queue#work-${state.id}`}>실행 요청과 검수 열기 →</Link>}{state.ok && <p><a href="/design">새 기록 작성하기</a></p>}</div>;}
export function DesignRequestForm() {
 const [state,action,pending]=useActionState(requestDesignWork,null);
 return <form action={action} className="stackForm">
  <label>업무명<input name="title" required maxLength={140} placeholder="예: 제품 페이지 사진 교체" /></label>
  <label>요청 내용<textarea name="objective" required maxLength={6000} rows={4} placeholder="어떤 화면을 어떻게 개선할까요?" /></label>
  <label>완료 기준<textarea name="criteria" required maxLength={3000} rows={3} defaultValue="HQ 마스터 기준을 적용하고, PC·모바일 검수와 변경 파일·실제 배포 결과를 기록해주세요." /></label>
  <label>우선순위<select name="priority" defaultValue="medium"><option value="low">낮음</option><option value="medium">보통</option><option value="high">높음</option><option value="urgent">긴급</option></select></label>
  <button className="hqButton" disabled={pending || state?.ok}>{pending?'접수 중…':'디자인실에 맡기기'}</button><Status state={state}/>
 </form>;
}
export function DesignDecisionForm() {
 const [state,action,pending]=useActionState(recordDesignDecision,null);
 return <form action={action} className="stackForm">
  <label>결정 제목<input name="title" required maxLength={140} placeholder="예: 제품 사진의 촬영 기준" /></label>
  <label>배경<textarea name="context" maxLength={3000} rows={2} /></label>
  <label>결정 내용<textarea name="decision" required maxLength={5000} rows={3} /></label>
  <label>결정 근거<textarea name="rationale" required maxLength={3000} rows={3} /></label>
  <button className="hqButton" disabled={pending || state?.ok}>{pending?'저장 중…':'결정과 근거 기록'}</button><Status state={state}/>
 </form>;
}
