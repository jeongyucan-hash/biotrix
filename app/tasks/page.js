import Link from "next/link";
import { formatKST } from "../../lib/sites/catalog";
import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createTask, updateTaskStatus } from "./actions";

export const metadata={title:"Tasks · BIOTRIX HQ",robots:{index:false,follow:false}};

const columns = [
  ["todo","To do"],
  ["in_progress","In progress"],
  ["review","Review"],
  ["done","Done"],
];

export default async function Tasks(){
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id,title,description,status,priority,due_at,created_at")
    .order("created_at",{ascending:false});

  const {data:work,error:workError}=await supabase.from("chatgpt_work_items").select("id,title,status,priority,department,updated_at").order("updated_at",{ascending:false}).limit(100);
  const labels={prepared:"접수",in_progress:"진행 중",result_ready:"검수 대기",accepted:"채택",archived:"보관",cancelled:"취소"};
  return (
    <HQShell active="Tasks" title="통합 업무함">
      <section className="hqPanel"><div className="panelHead"><h2>AI · 사이트 · 디자인 업무</h2><Link href="/work-queue">업무 접수 →</Link></div><p>일반 업무와 AI 업무를 이곳에서 확인합니다. 기존 기록은 유지되며 AI 업무의 실행·검수는 상세에서 처리합니다.</p>
        {workError ? <p role="alert">AI 업무를 불러오지 못했습니다.</p> : work?.length ? <div className="siteWorkList">{work.map(item=><Link key={item.id} href={`/work-queue?id=${item.id}#work-${item.id}`}><strong>{item.title}</strong><span>{labels[item.status]||item.status} · {item.department} · {item.priority}</span><small>{formatKST(item.updated_at)}</small></Link>)}</div> : <p>접수된 AI 업무가 없습니다.</p>}
        <p>최근 최대 100건 · 채택은 배포 완료와 별개입니다.</p>
      </section>
      <section className="hqPanel">
        <div className="panelHead">
          <h2>일반 업무 등록</h2>
          <span>직접 처리할 업무</span>
        </div>
        <form action={createTask} className="taskCreate">
          <input name="title" placeholder="업무 제목" required />
          <select name="priority" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button className="hqButton" type="submit">+ Add Task</button>
        </form>
      </section>

      <section className="kanban">
        {columns.map(([status,label])=>{
          const items=(tasks || []).filter((task)=>task.status===status);
          return (
            <div key={status}>
              <h3>{label} <span className="countBadge">{items.length}</span></h3>
              {items.length ? items.map((task)=>(
                <article className="taskCard" key={task.id}>
                  <div className="taskPriority">{task.priority}</div>
                  <strong>{task.title}</strong>
                  <form action={updateTaskStatus}>
                    <input type="hidden" name="id" value={task.id} />
                    <select name="status" defaultValue={task.status}>
                      {columns.map(([value,text])=><option key={value} value={value}>{text}</option>)}
                    </select>
                    <button type="submit">Move</button>
                  </form>
                </article>
              )) : <p>등록된 업무 없음</p>}
            </div>
          );
        })}
      </section>
    </HQShell>
  );
}
