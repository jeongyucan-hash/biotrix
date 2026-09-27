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

  return (
    <HQShell active="Tasks" title="Tasks">
      <section className="hqPanel">
        <div className="panelHead">
          <h2>New Task</h2>
          <span>Operational Work Queue</span>
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
