import HQShell from "../../components/HQShell";
import "../../auth-access.css";
import PasswordForm from "./password-form";
export default function SecurityPage() {
  return <HQShell active="비밀번호 설정" title="비밀번호 설정"><section className="hqPanel">
    <p>현재 로그인한 운영자 계정의 비밀번호를 설정하거나 변경합니다. 이후에는 이메일과 비밀번호로 로그인할 수 있습니다.</p>
    <PasswordForm />
  </section></HQShell>;
}
