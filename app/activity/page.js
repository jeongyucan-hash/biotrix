import Link from 'next/link';
import { redirect } from 'next/navigation';
import HQShell from '../components/HQShell';
import { createClient } from '../../lib/supabase/server';
import SyncHistory from './SyncHistory';

export const metadata = { title:'작업 기록 · BIOTRIX HQ', robots:{index:false,follow:false} };
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
const labels = { completed:'완료',running:'진행 중',recorded:'코드 기록',failed:'실패',queued:'대기' };
function date(value) { return value ? new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'}).format(new Date(value)) : '—'; }
function safeLink(value) {
  try { const url=new URL(value);return url.protocol==='https:' && (url.hostname==='github.com' || url.hostname.endsWith('.vercel.app')) ? url.href : null; } catch { return null; }
}
export default async function Activity({ searchParams }) {
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if (!user) redirect('/login');
  const {data:admin}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();
  if (!admin?.active) redirect('/setup');
  const params=await searchParams;
  const page=Math.max(1,Math.min(1000,Number.parseInt(params?.page || '1',10)||1));
  const {data:runs,error,count}=await db.from('agent_runs')
    .select('id,agent_name,objective,status,summary,input_json,output_json,created_at,completed_at',{count:'exact'})
    .order('created_at',{ascending:false}).order('id').range((page-1)*30,page*30-1);
  return <HQShell active="작업 기록" title="작업 기록">
    <section className="hqPanel"><div className="panelHead"><h2>업무부터 코드 변경까지</h2><span>{count ?? '—'}건</span></div>
      <p>작업 결과와 검수 근거를 남기고, 실제 코드 변경으로 이어지는 과정을 확인합니다.</p>
      <p className="historyNote">이 화면을 열면 GitHub 전체 브랜치의 2026년 9월 27일 이후 변경 이력을 확인합니다. 조회 간격은 최소 30분이며, 대화 내용은 자동 수집하지 않습니다.</p>
      <SyncHistory />
    </section>
    {error ? <section className="hqPanel" role="alert">기록을 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 열어 주세요.</section> : !runs?.length ? <section className="hqPanel">아직 저장된 작업 기록이 없습니다.</section> : <div className="historyList">{runs.map(run=>{
      const output=run.output_json || {};
      const links=[['코드 변경',output.commit_url],['변경 요청',output.pull_request],['미리보기',output.preview]].map(([label,url])=>[label,safeLink(url)]).filter(([,url])=>url);
      return <article className="hqPanel" key={run.id}>
        <div className="historyMeta"><span>{run.agent_name}</span><span>{labels[run.status] || run.status}</span><time>{date(run.completed_at || run.created_at)}</time></div>
        <h2>{run.summary || run.objective}</h2>
        {links.length>0 && <div className="historyLinks">{links.map(([label,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>}
        <details><summary>작업 내용과 검수 근거</summary><p>{run.objective}</p><pre>{JSON.stringify(output,null,2)}</pre></details>
      </article>;
    })}</div>}
    <nav className="historyPagination" aria-label="기록 페이지">{page>1 && <Link href={`/activity?page=${page-1}`}>← 이전</Link>}<span>{page} 페이지</span>{page*30<(count||0) && <Link href={`/activity?page=${page+1}`}>다음 →</Link>}</nav>
  </HQShell>;
}
