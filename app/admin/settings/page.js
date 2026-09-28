import { redirect } from "next/navigation";
import HQShell from "../../components/HQShell";
import { createClient } from "../../../lib/supabase/server";
import { inviteOperator, saveMailingDraft, updateOperator } from "./actions";

export const metadata = { title: "운영 관리 | BIOTRIX HQ", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const roles = [["owner","Owner"],["manager","Manager"],["cs","CS"],["logistics","Logistics"],["analyst","Analyst"]];
const notices = {
  "operator-saved":"운영자 권한을 저장했습니다.", invited:"초대 메일을 보냈고 운영자 권한을 등록했습니다.",
  "draft-saved":"메일 초안을 저장했습니다.", "invite-unavailable":"초대 기능에 필요한 서버 설정이 아직 없습니다.",
  "invite-failed":"초대 메일을 보내지 못했습니다. 주소와 초대 설정을 확인해 주세요.",
  "invite-role-failed":"초대 메일은 전송됐지만 권한 등록에 실패했습니다. 운영자 목록을 확인해 주세요.",
  "save-failed":"저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  "last-owner":"마지막 활성 Owner의 권한은 해제할 수 없습니다.",
  self:"현재 로그인한 Owner 계정은 이 화면에서 해제할 수 없습니다.",
  missing:"해당 운영자 계정을 찾지 못했습니다.", invalid:"입력값을 확인해 주세요.",
  unchanged:"변경된 항목이 없습니다.",
};

export default async function Admin({ searchParams }) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await db.from("admin_users").select("role,active")
    .eq("auth_user_id", user.id).maybeSingle();
  if (!me?.active) redirect("/setup");
  if (me.role !== "owner") redirect("/");

  const [operatorsResult, customersResult, customerCountResult, consentCountResult, ordersResult, productsResult, draftsResult] =
    await Promise.all([
      db.from("admin_users").select("auth_user_id,role,active,last_login_at"),
      db.from("customers").select("id,name,email,marketing_consent,created_at")
        .order("created_at", { ascending: false }).limit(100),
      db.from("customers").select("id", { count: "exact", head: true }),
      db.from("customers").select("id", { count: "exact", head: true })
        .eq("marketing_consent", true).not("email", "is", null).neq("email", ""),
      db.from("orders").select("*", { count: "exact", head: true }),
      db.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
      db.from("mailing_drafts").select("id,subject,preview_text,body,created_at,status")
        .order("created_at", { ascending: false }).limit(15),
    ]);
  const operators = operatorsResult.data || [];
  const customers = customersResult.data || [];
  const drafts = draftsResult.data || [];
  const error = [operatorsResult, customersResult, customerCountResult, consentCountResult, ordersResult, productsResult, draftsResult]
    .some(result => result.error);
  const { notice } = await searchParams;
  const inviteEnabled = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <HQShell active="설정" title="계정 · 메일링" eyebrow="BIOTRIX ADMIN · OWNER">
      {notices[notice] && <p className="adminNotice" role="status">{notices[notice]}</p>}
      {error && <p className="adminNotice" role="alert">일부 운영 데이터를 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.</p>}

      <section className="adminSummary" aria-label="운영 현황">
        <article><span>활성 운영자</span><strong>{operators.filter(o => o.active).length}</strong></article>
        <article><span>고객 계정</span><strong>{customerCountResult.count ?? "—"}</strong></article>
        <article><span>메일 수신 동의</span><strong>{consentCountResult.count ?? "—"}</strong></article>
        <article><span>활성 상품 / 주문</span><strong>{productsResult.count ?? "—"} / {ordersResult.count ?? "—"}</strong></article>
      </section>

      <div className="adminWorkGrid">
        <section className="hqPanel adminWorkspace">
          <div className="panelHead"><h2>운영자 계정</h2><span>Owner 전용</span></div>
          <p className="adminHelp">운영자 역할과 접근 상태를 관리합니다. 현재 로그인한 Owner는 여기서 해제할 수 없습니다.</p>
          {operators.length ? <div className="adminOperatorList">
            {operators.map(operator => (
              <form action={updateOperator} className="adminOperator" key={operator.auth_user_id}>
                <input type="hidden" name="id" value={operator.auth_user_id} />
                <div className="adminOperatorIdentity">
                  <strong>{operator.auth_user_id === user.id ? user.email : "운영자 계정"}</strong>
                  <small>{operator.auth_user_id}</small>
                </div>
                <label>역할<select name="role" defaultValue={operator.role} disabled={operator.auth_user_id === user.id}>
                  {roles.map(([value,label]) => <option value={value} key={value}>{label}</option>)}
                </select></label>
                <label>상태<select name="active" defaultValue={String(operator.active)} disabled={operator.auth_user_id === user.id}>
                  <option value="true">활성</option><option value="false">비활성</option>
                </select></label>
                <button className="hqButton" disabled={operator.auth_user_id === user.id}>저장</button>
              </form>
            ))}
          </div> : <div className="hqEmpty">등록된 운영자가 없습니다.</div>}
          <div className="adminDivider" />
          <h3>새 운영자 초대</h3>
          <form action={inviteOperator} className="adminInvite">
            <label>이메일<input name="email" type="email" placeholder="name@company.com" required maxLength={254} disabled={!inviteEnabled} /></label>
            <label>역할<select name="role" defaultValue="manager" disabled={!inviteEnabled}>
              {roles.filter(([value]) => value !== "owner").map(([value,label]) => <option value={value} key={value}>{label}</option>)}
            </select></label>
            <button className="hqButton" disabled={!inviteEnabled}>초대 메일 보내기</button>
          </form>
          {!inviteEnabled && <p className="adminHelp">초대 메일은 서버 인증 설정이 완료되면 사용할 수 있습니다. 기존 계정의 권한 변경은 가능합니다.</p>}
        </section>

        <section className="hqPanel adminWorkspace">
          <div className="panelHead"><h2>메일링</h2><span>초안 · 수신 동의 고객</span></div>
          <p className="adminHelp">수신 동의가 기록된 고객에게 보낼 내용을 준비합니다. 실제 발송 연결 전에는 메일이 전송되지 않습니다.</p>
          <div className="adminAudience"><strong>{consentCountResult.count ?? "—"}명</strong><span>현재 발송 가능 대상</span></div>
          <form action={saveMailingDraft} className="adminDraftForm">
            <label>제목<input name="subject" required maxLength={160} placeholder="메일 제목" /></label>
            <label>미리보기 문구<input name="preview_text" maxLength={200} placeholder="받은편지함에 표시할 짧은 문구" /></label>
            <label>본문<textarea name="body" required maxLength={20000} rows={7} placeholder="고객에게 전달할 내용을 입력하세요." /></label>
            <button className="hqButton">초안 저장</button>
          </form>
          <h3>저장된 초안</h3>
          {drafts.length ? <div className="adminDraftList">{drafts.map(draft => (
            <details key={draft.id}><summary><strong>{draft.subject}</strong><span>{new Date(draft.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })} · 초안</span></summary>
              {draft.preview_text && <p>{draft.preview_text}</p>}<p className="adminMailBody">{draft.body}</p>
            </details>
          ))}</div> : <p className="adminHelp">저장된 메일 초안이 없습니다.</p>}
        </section>
      </div>

      <section className="hqPanel adminWorkspace">
        <div className="panelHead"><h2>고객 계정 및 수신 동의</h2><span>최근 100명</span></div>
        <div className="adminCustomerList">
          {customers.length ? customers.map(customer => <div className="adminCustomer" key={customer.id}>
            <strong>{customer.name || customer.email || "이름 없음"}</strong>
            <span>{customer.email || "이메일 미등록"}</span>
            <span className={customer.marketing_consent && customer.email ? "adminConsented" : ""}>
              {customer.marketing_consent && customer.email ? "수신 동의" : "발송 제외"}
            </span>
          </div>) : <p className="adminHelp">아직 고객 계정이 없습니다.</p>}
        </div>
      </section>
    </HQShell>
  );
}
