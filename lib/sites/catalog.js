export const sites = [
  { id: 'brand', name: '브랜드 홈페이지', url: 'https://biotrix.co.kr', purpose: '회사와 브랜드를 소개하는 고객의 첫 방문지', team: '브랜드 · 콘텐츠', department: 'marketing', goal: '첫 화면의 메시지와 모바일 탐색을 개선해주세요.' },
  { id: 'commerce', name: '커머스', url: 'https://biotrix-commerce.vercel.app', purpose: '상품을 발견하고 구매로 이어지는 공간', team: '커머스 · 운영', department: 'operations', goal: '상품 탐색부터 구매까지 막히는 지점을 점검해주세요.' },
  { id: 'hq', name: 'HQ · 어드민', url: 'https://biotrix-hq.vercel.app/admin', purpose: '업무를 맡기고 결과와 변경 이력을 확인하는 공간', team: '제품 · 개발', department: 'operations', goal: '업무 등록부터 결과 검수까지 사용 흐름을 개선해주세요.' },
];

export function formatKST(value) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(value)) + ' KST';
}
