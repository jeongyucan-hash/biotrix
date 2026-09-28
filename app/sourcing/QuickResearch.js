'use client';
import {useActionState,useEffect,useState} from 'react';
import {quickResearch} from './actions';

export default function QuickResearch({enabled,configured}) {
  const [state,action,pending]=useActionState(quickResearch,{});
  const [requestId,setRequestId]=useState('');
  const [request,setRequest]=useState('');
  useEffect(()=>setRequestId(crypto.randomUUID()),[]);
  return <section className="hqPanel">
    <h2>무엇을 찾아드릴까요?</h2>
    <p>한 문장으로 맡기세요. 요청 저장부터 공급처 웹조사까지 한 번에 진행합니다.</p>
    <form action={action} className="stackForm">
      <input type="hidden" name="request_id" value={requestId}/>
      <label htmlFor="quick-request">하고 싶은 일을 편하게 적어 주세요</label>
      <textarea id="quick-request" name="request" rows="3" minLength={5} maxLength={3000} required value={request} onChange={e=>setRequest(e.target.value)} readOnly={pending || Boolean(state.missionId)} placeholder="쿠팡에서 위탁판매할 건강기능식품 공급처를 찾아줘."/>
      <small>기본 조건: 쿠팡 우선 · 초기 투입 상한 100만원. 가격·마진은 임의로 확정하지 않습니다. 채널·예산을 바꾸려면 아래 상세 설정을 이용해 주세요.</small>
      <small>공개 자료 조사만 실행합니다. 구매·업체 연락·상품 게시를 하지 않습니다. AI API 비용이 발생할 수 있습니다.</small>
      <button className="hqButton" type="submit" disabled={pending || !requestId || !enabled || !configured || Boolean(state.missionId)}>{pending?'공급처 조사 중… 최대 2분 정도 기다려 주세요': '이 내용으로 조사 시작'}</button>
      {!enabled && <p role="alert">현재 AI 조사가 꺼져 있습니다. 관리자 설정 확인이 필요합니다.</p>}
      {!configured && <p role="alert">AI 서버 연결 설정이 필요합니다. 반복 입력하지 않으셔도 됩니다.</p>}
    </form>
    <div aria-live="polite">{state.error && <p role="alert">{state.error}</p>}{state.message && <p>{state.message}</p>}
      {state.missionId && <><p><a href={`#mission-${state.missionId}`}>저장된 요청 · 실행 결과 확인 ↓</a></p><a href="/sourcing">다른 요청 시작</a></>}
    </div>
  </section>;
}
