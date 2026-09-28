export function safeNext(value) {
  if (typeof value !== "string" || !/^\/(?!\/)/.test(value) || /[\\\s%]/.test(value)) return "/";
  if (/^\/(login|auth)(\/|\?|#|$)/.test(value)) return "/";
  return value;
}
export function passwordIssue(password, confirmation) {
  if (password.length < 12) return "비밀번호는 12자 이상으로 설정해 주세요.";
  if (password.length > 128) return "비밀번호는 128자 이하로 설정해 주세요.";
  if (password !== confirmation) return "두 비밀번호가 일치하지 않습니다.";
  return "";
}
