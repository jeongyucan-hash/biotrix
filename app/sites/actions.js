'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
import { sites, formatKST } from '../../lib/sites/catalog';

export async function requestSiteWork(previous, form) {
  const site = sites.find(s => s.id === form.get('site'));
  const title = String(form.get('title') || '').trim();
  const objective = String(form.get('objective') || '').trim();
  const criteria = String(form.get('criteria') || '').trim();
  const priority = String(form.get('priority') || 'medium');
  if (!site || !title || title.length > 160 || !objective || objective.length > 6000 || !criteria || criteria.length > 3000 || !['low','medium','high','urgent'].includes(priority)) {
    return { ok: false, message: '대상 사이트, 업무명, 요청 내용과 완료 기준을 확인해주세요.' };
  }
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { ok: false, message: '로그인 후 다시 등록해주세요.' };
  const { data: admin } = await db.from('admin_users').select('active').eq('auth_user_id', user.id).maybeSingle();
  if (!admin?.active) return { ok: false, message: '운영자 권한이 필요합니다.' };
  const { data: id, error } = await db.rpc('prepare_chatgpt_work_item', {
    p_department: site.department,
    p_title: `[사이트:${site.id}] ${title}`,
    p_objective: `대상: ${site.name}\n주소: ${site.url}\n담당: ${site.team}\n접수: ${formatKST(new Date())}\n\n요청\n${objective}\n\n완료 기준\n${criteria}\n\n업무 절차\n1. 현재 상태와 기존 변경사항 확인\n2. 개선안 수립 및 구현\n3. 모바일·데스크톱과 핵심 동작 검수\n4. 변경 파일, 커밋, 배포 주소, 검수 증거와 남은 문제 보고\n5. 후속 개선안 제안\n\n실행하지 않은 작업을 완료로 표시하지 마세요.`,
    p_priority: priority, p_opportunity_id: null, p_sourcing_mission_id: null,
  });
  if (error || !id) return { ok: false, message: '저장하지 못했습니다. 입력 내용을 유지한 채 다시 시도해주세요.' };
  revalidatePath('/sites'); revalidatePath('/work-queue'); revalidatePath('/admin');
  return { ok: true, id, message: '업무가 접수됐습니다. 실행 요청과 결과 검수는 업무 상세에서 이어가세요.' };
}
