'use client';
import {useActionState,useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {runResearch} from './actions';

export default function ResearchControl({missionId,enabled,configured,closed,job}) {
  const [state,action,pending]=useActionState(runResearch,{});
  const router=useRouter();
  const running=job?.status==='running' && Date.now()-new Date(job.started_at).getTime()<240000;
  useEffect(()=>{
    if(!running && !pending) return;
    const timer=setInterval(()=>router.refresh(),5000);
    return ()=>clearInterval(timer);
  },[running,pending,router]);
  return <div className="stackForm">
    <p>{!configured ? '실행 인증 미연결: HQ의 AI Gateway 설정을 확인해 주세요.' :
      !enabled ? '소싱 AI 실행이 꺼져 있습니다.' : '실행 버튼으로 실제 웹조사를 시작합니다. 연결 성공 여부는 실행 기록으로 확인합니다.'}</p>
    <form action={action} className="stackForm">
      <input type="hidden" name="mission_id" value={missionId}/>
      <label htmlFor={`instruction-${missionId}`}>HQ에 조사 지시</label>
      <textarea id={`instruction-${missionId}`} name="instruction" rows="3" maxLength="3000"
        placeholder="예: 과일 위탁 공급처의 공개 상품·공급가·배송·반품·쿠팡 판매조건을 조사하고, 미확인 사항을 따로 정리해 줘."/>
      <button type="submit" className="hqButton" disabled={pending || running || !enabled || !configured || closed}>
        {pending || running ? '웹조사 실행 중…' : 'AI 웹조사 실행'}
      </button>
      <small>1회 최대 후보 5개 · 웹검색 3회 · 출력 5,000토큰 · 24시간 최대 10회. API 비용이 발생할 수 있습니다. 정기 자동실행은 아직 연결되지 않았습니다.</small>
    </form>
    <div aria-live="polite">{state.error && <p role="alert">{state.error}</p>}{state.message && <p>{state.message}</p>}</div>
    {job?.status==='running' && !running && <p role="alert">실행 제한 시간을 넘겼습니다. 다음 실행 시 이 기록을 중단으로 정리합니다.</p>}
  </div>;
}
