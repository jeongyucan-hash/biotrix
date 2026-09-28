import { createHash } from 'node:crypto';

export const REPOSITORY = 'jeongyucan-hash/biotrix';
export const HISTORY_START = '2026-09-27T00:00:00Z';
export function recordId(key) {
  const hash = createHash('sha256').update(`${REPOSITORY}:${key}`).digest('hex').slice(0, 32);
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20)}`;
}
export const SYNC_ID = recordId('github-sync');

async function github(path, fetcher) {
  const response = await fetcher(`https://api.github.com/repos/${REPOSITORY}/${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'BIOTRIX-HQ' },
    cache: 'no-store', signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(response.status === 403 || response.status === 429
    ? 'GitHub 조회 한도에 도달했습니다. 잠시 후 다시 확인해 주세요.' : `GitHub 이력을 가져오지 못했습니다 (${response.status}).`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('GitHub 응답 형식을 확인할 수 없습니다.');
  return { rows, more: /rel="next"/.test(response.headers.get('link') || '') };
}

export async function collectCommits(fetcher = fetch) {
  const branches = [];
  for (let page=1;page<=3;page++) {
    const result = await github(`branches?per_page=100&page=${page}`, fetcher);
    branches.push(...result.rows.map(row => row.name).filter(name => typeof name === 'string'));
    if (!result.more) break;
    if (page===3) throw new Error('브랜치가 많아 일부 기록을 아직 가져오지 못했습니다.');
  }
  const commits = new Map();
  for (const branch of branches) {
    for (let page=1;page<=3;page++) {
      const result = await github(`commits?sha=${encodeURIComponent(branch)}&since=${encodeURIComponent(HISTORY_START)}&per_page=100&page=${page}`, fetcher);
      for (const row of result.rows) {
        if (!/^[a-f0-9]{40}$/.test(row.sha) || !row.commit?.message || !row.commit?.committer?.date) {
          throw new Error('일부 커밋의 필수 정보가 없어 동기화를 마치지 못했습니다.');
        }
        const saved = commits.get(row.sha);
        if (saved) { if (!saved.branches.includes(branch)) saved.branches.push(branch); }
        else commits.set(row.sha, { ...row, branches: [branch] });
      }
      if (!result.more) break;
      if (page===3) throw new Error(`${branch}의 변경 이력이 많아 추가 동기화가 필요합니다.`);
    }
  }
  return { commits: [...commits.values()], branches };
}

export function commitRecord(commit) {
  return {
    id: recordId(`commit:${commit.sha}`), agent_name: 'GitHub · 코드 변경',
    objective: commit.commit.message, status: 'recorded',
    summary: commit.commit.message.split('\n')[0],
    input_json: { source: 'github', repository: REPOSITORY, branches: commit.branches },
    output_json: { commit: commit.sha, commit_url: `https://github.com/${REPOSITORY}/commit/${commit.sha}`,
      authored_at: commit.commit.author?.date || null, usage_metering: 'not_applicable' },
    completed_at: commit.commit.committer.date,
  };
}
