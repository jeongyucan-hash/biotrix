'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
import { collectCommits, commitRecord, SYNC_ID, HISTORY_START } from '../../lib/work-history.mjs';

export async function syncCodeHistory() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { ok:false, message:'로그인이 필요합니다.' };
  const { data: admin, error: adminError } = await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();
  if (adminError || !admin?.active) return { ok:false, message:'운영자 권한이 필요합니다.' };
  const { data:last, error:lastError } = await db.from('agent_runs').select('completed_at,status').eq('id',SYNC_ID).maybeSingle();
  if (lastError) return { ok:false, message:'작업 기록 저장소를 확인하지 못했습니다.' };
  if (last?.status === 'completed' && Date.now()-Date.parse(last.completed_at)<30*60*1000) {
    return { ok:true, changed:false, message:'최근 30분 이내에 동기화했습니다.' };
  }
  try {
    const { commits, branches } = await collectCommits();
    const rows = commits.map(commitRecord);
    for (let offset=0;offset<rows.length;offset+=100) {
      const { error } = await db.from('agent_runs').upsert(rows.slice(offset,offset+100), { onConflict:'id', ignoreDuplicates:true });
      if (error) throw new Error('코드 변경 기록을 저장하지 못했습니다. 다시 시도하면 누락분을 이어서 저장합니다.');
    }
    const { error } = await db.from('agent_runs').upsert({ id:SYNC_ID, agent_name:'GitHub · 기록 동기화',
      objective:'저장소 전체 브랜치의 코드 변경 기록 동기화', status:'completed', summary:`${branches.length}개 브랜치 · ${commits.length}개 커밋 확인`,
      input_json:{source:'github-sync',since:HISTORY_START}, output_json:{branches,commits:commits.length}, completed_at:new Date().toISOString(),
    }, { onConflict:'id' });
    if (error) throw new Error('코드 기록은 저장했으나 동기화 완료 상태를 저장하지 못했습니다.');
    revalidatePath('/activity'); revalidatePath('/agents');
    return { ok:true, changed:true, message:`${commits.length}개 코드 변경 이력을 확인했습니다.` };
  } catch (error) {
    return { ok:false, message:error.message || '동기화에 실패했습니다. 기존 기록은 보존됩니다.' };
  }
}
