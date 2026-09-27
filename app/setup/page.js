import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export const metadata = { title: "HQ Setup", robots: { index: false, follow: false } };

export default async function SetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (admin?.active) redirect("/");

  return (
    <main className="loginShell">
      <section className="loginCard">
        <div className="eyebrow">BIOTRIX HQ</div>
        <h1>Operator setup</h1>
        <p>로그인은 완료되었습니다. 이 계정은 아직 BIOTRIX 운영자 권한이 부여되지 않았습니다.</p>
        <div className="loginMessage">
          로그인 계정: {user.email}
        </div>
        <p>최초 owner 등록이 완료되면 Dashboard로 자동 진입할 수 있습니다.</p>
      </section>
    </main>
  );
}
