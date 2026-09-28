import Link from 'next/link';
import HQShell from '../components/HQShell';
import { createClient } from '../../lib/supabase/server';
import { sites, formatKST } from '../../lib/sites/catalog';
import RequestForm from './RequestForm';

export const metadata = { title: '사이트 통합 관리 · BIOTRIX HQ', robots: { index: false, follow: false } };
const statuses = { prepared: '접수', in_progress: '진행 중', result_ready: '검수 대기', accepted: '채택', archived: '보관', cancelled: '취소' };

export default async function Sites({ searchParams }) {
  const params = await searchParams;
  const selected = sites.find(s => s.id === params?.site) || sites[0];
  const db = await createClient();
  const { data, error } = await db.from('chatgpt_work_items').select('id,title,status,priority,updated_at').like('title', '[사이트:%').order('updated_at', { ascending: false }).limit(100);
  const items = data || [];
  return <HQShell active="사이트 통합 관리" title="사이트 통합 관리">
    <section className="hqPanel"><h2>사이트를 열고, 다음 개선을 맡기세요.</h2><p>세 공간의 바로가기와 개선 업무를 한곳에서 관리합니다.</p><p className="siteNotice">현재 실행 방식: HQ 접수 → ChatGPT Work에서 실행 → 결과 저장·검수. 접수만으로 자동 개발이나 배포가 시작되지는 않습니다.</p></section>
    <section className="siteHubGrid" aria-label="BIOTRIX 사이트">
      {sites.map(site => <article key={site.id} className="hqPanel siteHubCard">
        <span className="eyebrow">{site.team}</span><h2>{site.name}</h2><p>{site.purpose}</p><small>{new URL(site.url).hostname}</small>
        <div className="siteHubActions"><a className="hqButton" href={site.url} target="_blank" rel="noopener noreferrer">사이트 열기 ↗</a><Link href={`/sites?site=${site.id}#request`}>개선 업무 맡기기 →</Link></div>
      </article>)}
    </section>
    <section className="hqGrid2">
      <article className="hqPanel" id="request"><div className="panelHead"><h2>개선 업무 접수</h2><span>{selected.name}</span></div><RequestForm key={selected.id} selected={selected} /></article>
      <article className="hqPanel"><div className="panelHead"><h2>사이트 개선 현황</h2><Link href="/work-queue">전체 업무 →</Link></div>
        {error ? <p role="alert">업무 현황을 불러오지 못했습니다. 새로고침해주세요.</p> : items.length ? <div className="siteWorkList">{items.map(item => <Link href={`/work-queue#work-${item.id}`} key={item.id}><strong>{item.title}</strong><span>{statuses[item.status] || item.status} · {item.priority}</span><small>{formatKST(item.updated_at)}</small></Link>)}<p>최근 최대 100건 표시 · 채택은 운영 배포 완료를 의미하지 않습니다.</p></div> : <div className="hqEmpty"><strong>첫 개선 업무를 맡겨보세요.</strong><p>접수된 업무와 검수 상태가 이곳에 모입니다.</p></div>}
        <hr /><h3>HQ 업무 원칙</h3><p><Link href="/design">홈페이지 디자인 기준·마스터·수정 요청은 디자인실에서 →</Link></p><ol><li>요청과 완료 기준을 남깁니다.</li><li>담당 역할이 구현하고 검수 증거를 제출합니다.</li><li>결과를 검토하고 채택하면 지식에 저장합니다.</li><li>다음 개선안을 새 업무로 연결합니다.</li></ol><Link href="/activity">코드 변경·작업 기록 보기 →</Link>
      </article>
    </section>
  </HQShell>;
}
