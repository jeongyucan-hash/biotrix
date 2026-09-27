import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { addExperiment, addRequirement, createRDFromOpportunity, createRDProject, updateExperiment, updateRDProject } from "./actions";

export const metadata={title:"R&D · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  if(value===null || value===undefined) return "—";
  return new Intl.NumberFormat("ko-KR").format(Number(value))+"원";
}

export default async function RD(){
  const supabase=await createClient();

  const [projectsResult,requirementsResult,experimentsResult,oppsResult]=await Promise.all([
    supabase.from("rd_projects").select("*").order("updated_at",{ascending:false}),
    supabase.from("rd_requirements").select("*").order("created_at",{ascending:false}),
    supabase.from("rd_experiments").select("*").order("created_at",{ascending:false}),
    supabase.from("opportunities").select("id,title,status,stage").order("updated_at",{ascending:false}).limit(50),
  ]);

  const projects=projectsResult.data || [];
  const requirements=requirementsResult.data || [];
  const experiments=experimentsResult.data || [];
  const opportunities=oppsResult.data || [];

  return (
    <HQShell active="R&D" title="Product & R&D">
      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>Start from Opportunity</h2>
            <span>Founder Room → R&D</span>
          </div>
          <form action={createRDFromOpportunity} className="stackForm">
            <select name="opportunity_id" defaultValue="" required>
              <option value="" disabled>Opportunity 선택</option>
              {opportunities.map((o)=><option key={o.id} value={o.id}>{o.title} · {o.stage}/{o.status}</option>)}
            </select>
            <button className="hqButton" type="submit">R&D Project 생성</button>
          </form>
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>New R&D Project</h2>
            <span>독립 프로젝트</span>
          </div>
          <form action={createRDProject} className="stackForm">
            <input name="name" placeholder="프로젝트명" required />
            <input name="target_customer" placeholder="타깃 고객" />
            <textarea name="target_problem" rows="3" placeholder="해결하려는 고객 문제" />
            <textarea name="hypothesis" rows="3" placeholder="제품 가설" />
            <input name="target_launch_date" type="date" />
            <button className="hqButton" type="submit">프로젝트 생성</button>
          </form>
        </article>
      </section>

      {projects.length ? projects.map((project)=>{
        const reqs=requirements.filter((r)=>r.rd_project_id===project.id);
        const exps=experiments.filter((e)=>e.rd_project_id===project.id);
        const passed=exps.filter((e)=>e.status==="passed").length;
        const failed=exps.filter((e)=>e.status==="failed").length;

        return (
          <section className="hqPanel" key={project.id}>
            <div className="panelHead">
              <div>
                <h2>{project.name}</h2>
                <span>{project.stage} · {project.status}</span>
              </div>
              <div className="rdCounters">
                <span>{reqs.length} requirements</span>
                <span>{passed} passed</span>
                <span>{failed} failed</span>
              </div>
            </div>

            <div className="rdOverview">
              <div><span>Customer</span><b>{project.target_customer || "TBD"}</b></div>
              <div><span>Problem</span><b>{project.target_problem || "TBD"}</b></div>
              <div><span>Hypothesis</span><b>{project.hypothesis || "TBD"}</b></div>
              <div><span>Target launch</span><b>{project.target_launch_date || "TBD"}</b></div>
            </div>

            <form action={updateRDProject} className="rdStatusForm">
              <input type="hidden" name="id" value={project.id} />
              <select name="stage" defaultValue={project.stage}>
                <option value="concept">Concept</option>
                <option value="feasibility">Feasibility</option>
                <option value="spec">Specification</option>
                <option value="prototype">Prototype</option>
                <option value="validation">Validation</option>
                <option value="ready">Ready</option>
                <option value="hold">Hold</option>
                <option value="killed">Killed</option>
              </select>
              <select name="status" defaultValue={project.status}>
                <option value="active">Active</option>
                <option value="hold">Hold</option>
                <option value="completed">Completed</option>
                <option value="killed">Killed</option>
              </select>
              <button type="submit">Project status</button>
            </form>

            <div className="rdColumns">
              <div>
                <h3>Requirements</h3>
                <form action={addRequirement} className="compactStack">
                  <input type="hidden" name="rd_project_id" value={project.id} />
                  <select name="requirement_type" defaultValue="customer">
                    <option value="customer">Customer</option>
                    <option value="technical">Technical</option>
                    <option value="quality">Quality</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="cost">Cost</option>
                    <option value="packaging">Packaging</option>
                    <option value="manufacturing">Manufacturing</option>
                  </select>
                  <input name="requirement" placeholder="요구조건" required />
                  <input name="target" placeholder="목표/판정 기준" />
                  <button type="submit">+ Requirement</button>
                </form>

                <div className="rdList">
                  {reqs.map((req)=>(
                    <div key={req.id}>
                      <span>{req.requirement_type}</span>
                      <b>{req.requirement}</b>
                      <small>{req.target || "Target TBD"} · {req.status}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3>Experiments</h3>
                <form action={addExperiment} className="compactStack">
                  <input type="hidden" name="rd_project_id" value={project.id} />
                  <input name="title" placeholder="실험명" required />
                  <input name="hypothesis" placeholder="검증 가설" />
                  <textarea name="method" rows="2" placeholder="방법" />
                  <textarea name="success_criteria" rows="2" placeholder="성공 기준" />
                  <input name="estimated_cost" type="number" min="0" step="1" placeholder="예상비용" />
                  <button type="submit">+ Experiment</button>
                </form>

                <div className="rdList">
                  {exps.map((exp)=>(
                    <div className="rdExperiment" key={exp.id}>
                      <span>{exp.status}</span>
                      <b>{exp.title}</b>
                      <small>{exp.success_criteria || "Criteria TBD"} · {won(exp.estimated_cost)}</small>
                      <form action={updateExperiment}>
                        <input type="hidden" name="id" value={exp.id} />
                        <select name="status" defaultValue={exp.status}>
                          <option value="planned">Planned</option>
                          <option value="running">Running</option>
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                          <option value="inconclusive">Inconclusive</option>
                        </select>
                        <input name="result" defaultValue={exp.result || ""} placeholder="결과 요약" />
                        <button type="submit">Save</button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      }) : (
        <section className="hqPanel">
          <div className="hqEmpty">
            <strong>아직 R&D Project가 없습니다.</strong>
            <p>Founder Room의 Opportunity를 R&D로 승격하거나 독립 프로젝트를 생성하세요.</p>
          </div>
        </section>
      )}
    </HQShell>
  );
}
