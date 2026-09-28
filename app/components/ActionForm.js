'use client';
import { useActionState } from 'react';
export default function ActionForm({action,children,className}){
  const [state,submit,pending]=useActionState(async (_previous,form)=>{
    try{return await action(form);}catch{return {ok:false,message:'처리하지 못했습니다. 잠시 후 다시 시도해주세요.'};}
  },null);
  return <form action={submit} className={className}><fieldset disabled={pending} style={{border:0,padding:0,margin:0,minWidth:0,display:'contents'}}>{children}</fieldset>{pending && <p role="status">처리 중…</p>}{state && <p role={state.ok?'status':'alert'}>{state.message}</p>}</form>;
}
