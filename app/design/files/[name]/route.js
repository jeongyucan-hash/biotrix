import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createClient} from '../../../../lib/supabase/server';
import {resolveAsset} from '../../../../lib/design/validation.mjs';
import manifest from '../../../../lib/design/manifest.json';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request,{params}) {
 const {name}=await params;const file=resolveAsset(manifest,name);
 if(!file)return new Response('Not found',{status:404});
 const db=await createClient();const {data:{user}}=await db.auth.getUser();
 if(!user)return new Response('Authentication required',{status:401});
 const {data:admin}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();
 if(!admin?.active)return new Response('Forbidden',{status:403});
 try {
  const body=await readFile(path.join(process.cwd(),'design-assets',file.name));
  return new Response(body,{headers:{'Content-Type':file.mime,'Content-Disposition':`${file.inline?'inline':'attachment'}; filename="${file.name}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'X-Robots-Tag':'noindex'}});
 } catch {return new Response('File unavailable',{status:503});}
}
