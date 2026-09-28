'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { syncCodeHistory } from './actions';

export default function SyncHistory() {
  const router = useRouter();
  const started = useRef(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('코드 변경 이력을 확인합니다.');
  async function sync() {
    setBusy(true);
    try {
      const result = await syncCodeHistory();
      setMessage(result.message);
      if (result.ok && result.changed) router.refresh();
    } catch { setMessage('연결이 끊겼습니다. 다시 확인해 주세요.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { if (!started.current) { started.current=true; sync(); } }, []);
  return <div className="historySync"><button className="hqButton" disabled={busy} onClick={sync}>{busy?'확인 중…':'코드 기록 확인'}</button><p role="status">{message}</p></div>;
}
