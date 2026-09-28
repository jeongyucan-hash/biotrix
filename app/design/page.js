import Link from 'next/link';
import Image from 'next/image';
import {redirect} from 'next/navigation';
import HQShell from '../components/HQShell';
import {createClient} from '../../lib/supabase/server';
import {formatKST} from '../../lib/sites/catalog';
import manifest from '../../lib/design/manifest.json';
import {DesignRequestForm,DesignDecisionForm} from './Forms';
export const metadata={title:'홈페이지 디자인실 · BIOTRIX HQ',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
const statuses={prepared:'접수',in_progress:'진행 중',result_ready:'검수 대기',accepted:'채택',archived:'보관',cancelled:'취소'};
export default async function DesignOffice(){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 const {data:admin}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();if(!admin?.active)redirect('/setup');
 const [department,decisions,work,docs]=await Promise.all([
  db.from('company_settings').select('value').eq('key','design.department').maybeSingle(),
  db.from('decisions').select('id,title,decision,rationale,decided_at,status').like('title','[디자인실]%').order('decided_at',{ascending:false}).limit(30),
  db.from('chatgpt_work_items').select('id,title,status,updated_at').like('title','[디자인실]%').order('updated_at',{ascending:false}).limit(30),
  db.from('documents').select('id,title,content,updated_at').eq('category','website-design').order('updated_at',{ascending:false}).limit(20)
 ]);
 const config=department.data?.value;
 return <HQShell active="홈페이지 디자인실" title="홈페이지 디자인실" eyebrow="BIOTRIX / DESIGN OFFICE">
  <section className="designIntro hqPanel"><div><span className="designTag">DESIGN MASTER {manifest.version}</span><h2>일관된 브랜드를 만드는 곳.</h2><p>사진과 문구부터 화면과 배포까지, 홈페이지 디자인의 기준과 결정을 이곳에 모읍니다.</p><p className="historyNote">HQ에서 결정·접수하고 ChatGPT Work에서 실행합니다. 업무 등록만으로 무인 개발이나 배포가 시작되지는 않습니다.</p></div><Image unoptimized src="/design/files/brand-triptych.jpg" alt="같은 조명과 배경을 적용한 배, 물, 무상표 용기의 브랜드 무드 이미지" width={1536} height={1024}/></section>
  <section className="designStatus"><span>마스터: 제작 완료</span><span>브랜드 사이트: DM-2.0 적용 전</span><Link href="/activity">실행·배포 기록 →</Link></section>
  <section className="hqGrid2"><article className="hqPanel"><h2>현재 디자인 기준</h2>{department.error || !config?<p role="alert">기준을 불러오지 못했습니다. 작업 전에 연결 상태를 확인해 주세요.</p>:<><h3>{config.direction}</h3><p>{config.photography}</p><div className="designSwatches">{Object.entries(config.palette||{}).filter(([,v])=>/^#[0-9a-f]{6}$/i.test(v)).map(([key,value])=><div key={key}><i style={{backgroundColor:value}}/><strong>{key}</strong><span>{value}</span></div>)}</div></>}<p>담당: 디자인 총괄 · 브랜드·사진 · UX·UI · 프런트엔드 · 품질 검수</p><p className="historyNote">하나의 부서 안에서 나눈 책임 역할입니다. 각각의 자동 AI 실행기가 아닙니다.</p></article>
  <article className="hqPanel"><h2>마스터 파일</h2><p>18개 보드로 브랜드·모바일·커머스·HQ 기준을 정리했습니다.</p><div className="designFiles">{manifest.files.filter(f=>f.download).map(f=><a key={f.name} href={`/design/files/${f.name}`}><strong>{f.label}</strong><span>{f.description}</span></a>)}</div><p className="historyNote">AI는 벡터 PDF 기반 호환본입니다. Adobe 네이티브 저장·앱 열기 검수는 미실시이며, SVG 편집 원본을 함께 제공합니다.</p></article></section>
  <section className="hqGrid2"><article className="hqPanel" id="request"><h2>디자인 업무 맡기기</h2><p>현재 기준과 최근 결정이 요청에 자동으로 포함됩니다.</p><DesignRequestForm/></article><article className="hqPanel"><h2>디자인실 업무 현황</h2>{work.error?<p role="alert">업무를 불러오지 못했습니다.</p>:work.data?.length?<div className="siteWorkList">{work.data.map(w=><Link href={`/work-queue#work-${w.id}`} key={w.id}><strong>{w.title}</strong><span>{statuses[w.status]||w.status}</span><small>{formatKST(w.updated_at)}</small></Link>)}</div>:<p>새 업무를 등록하면 이곳에 표시됩니다.</p>}<p className="historyNote">최근 30건 · 채택과 운영 배포는 별도 상태입니다.</p><Link href="/work-queue">전체 업무 →</Link></article></section>
  <section className="hqGrid2"><article className="hqPanel"><h2>디자인 결정 기록</h2><DesignDecisionForm/></article><article className="hqPanel"><h2>결정과 근거</h2>{decisions.error?<p role="alert">결정 기록을 불러오지 못했습니다.</p>:<div className="designDecisions">{decisions.data?.map(d=><details key={d.id}><summary>{d.title}</summary><p>{d.decision}</p><p><strong>근거:</strong> {d.rationale}</p><small>{formatKST(d.decided_at)} · {d.status}</small></details>)}</div>}<p className="historyNote">최근 30건 · 수정은 새 결정으로 남겨 이전 판단을 보존합니다.</p></article></section>
  <section className="hqPanel"><h2>디자인실 문서</h2>{docs.error?<p role="alert">문서를 불러오지 못했습니다.</p>:docs.data?.map(d=><details key={d.id} className="designDoc"><summary>{d.title}</summary><p>{d.content}</p><small>{formatKST(d.updated_at)}</small></details>)}</section>
 </HQShell>;
}
