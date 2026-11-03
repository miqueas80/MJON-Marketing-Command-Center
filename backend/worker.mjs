// Cloudflare Worker: fail-closed Cloudflare Access + per-owner D1 backups.
// No WhatsApp integration. Static assets may be served only after Access auth.
export const MAX_BYTES = 256 * 1024;
export const KINDS = Object.freeze(['clients','orders','deliverables','approvals','audit','messages','settings']);
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers}});
const fail=(status,error)=>json({ok:false,error},status);
const emailOf=value=>typeof value==='string'?value.trim().toLowerCase():'';
export function validateSnapshot(snapshot){
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)||snapshot.format!=='mjon-command-backup-v1'||!Array.isArray(snapshot.records))throw Error('invalid_snapshot');
  if(snapshot.records.length>3000)throw Error('too_many_records');
  const seen=new Set();
  for(const rec of snapshot.records){
    if(!rec||typeof rec!=='object'||!KINDS.includes(rec.store)||!rec.value||typeof rec.value!=='object'||Array.isArray(rec.value))throw Error('invalid_record');
    const id=rec.value.id;
    if(typeof id!=='string'||id.length<1||id.length>128||/[\x00-\x1f]/.test(id))throw Error('invalid_id');
    const key=rec.store+'\0'+id;
    if(seen.has(key))throw Error('duplicate_record');
    seen.add(key);
  }
  return snapshot;
}
export function parseIfMatch(request){
  const value=request.headers.get('if-match');
  if(value===null)return null;
  if(value==='"0"')return 0;
  const m=/^"([1-9][0-9]{0,9})"$/.exec(value);
  return m?Number(m[1]):undefined;
}
export async function identity(env,ctx){
  if(!env.ACCESS_AUD||!env.ALLOWED_EMAIL||!ctx?.access||ctx.access.aud!==env.ACCESS_AUD)return null;
  const person=await ctx.access.getIdentity().catch(()=>null);
  const email=emailOf(person?.email);
  const allowed=String(env.ALLOWED_EMAIL).split(',').map(emailOf).filter(Boolean);
  return email&&allowed.includes(email)?email:null;
}
export async function handleAPI(request,env,ctx){
  const url=new URL(request.url);
  if(request.method==='OPTIONS')return fail(405,'cors_disabled');
  const origin=request.headers.get('origin');
  if(origin&&origin!==url.origin)return fail(403,'cross_origin_forbidden');
  const email=await identity(env,ctx);
  if(!email)return fail(401,'cloudflare_access_required');
  if(!env.DB)return fail(503,'database_not_configured');
  if(url.pathname==='/api/v1/status'&&request.method==='GET')return json({ok:true,mode:'cloud',authenticated:true,owner:email,whatsapp:'disconnected',limits:{maxBytes:MAX_BYTES,maxRecords:3000}});
  if(url.pathname!=='/api/v1/snapshot')return fail(404,'route_not_found');
  if(request.method==='GET'){
    const row=await env.DB.prepare('SELECT revision,data_json,updated_at FROM cloud_snapshots WHERE owner_email=?').bind(email).first();
    if(!row)return json({ok:true,revision:0,snapshot:null});
    return json({ok:true,revision:row.revision,snapshot:JSON.parse(row.data_json),updatedAt:row.updated_at},200,{etag:'"'+row.revision+'"'});
  }
  if(request.method!=='PUT')return fail(405,'method_not_allowed');
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return fail(415,'json_required');
  const expected=parseIfMatch(request);
  if(expected===null||expected===undefined)return fail(428,'if_match_required');
  const length=Number(request.headers.get('content-length'));
  if(Number.isFinite(length)&&length>MAX_BYTES)return fail(413,'payload_too_large');
  const raw=await request.text();
  if(new TextEncoder().encode(raw).length>MAX_BYTES)return fail(413,'payload_too_large');
  let data;try{data=validateSnapshot(JSON.parse(raw));}catch(e){return fail(422,['invalid_snapshot','invalid_record','invalid_id','duplicate_record','too_many_records'].includes(e.message)?e.message:'invalid_json');}
  const body=JSON.stringify(data);
  if(new TextEncoder().encode(body).length>MAX_BYTES)return fail(413,'payload_too_large');
  let revision;
  if(expected===0){
    const result=await env.DB.prepare('INSERT INTO cloud_snapshots(owner_email,revision,data_json) VALUES(?,1,?) ON CONFLICT(owner_email) DO NOTHING').bind(email,body).run();
    if(result.meta?.changes!==1)return fail(409,'revision_conflict');
    revision=1;
  }else{
    const result=await env.DB.prepare('UPDATE cloud_snapshots SET revision=revision+1,data_json=?,updated_at=CURRENT_TIMESTAMP WHERE owner_email=? AND revision=?').bind(body,email,expected).run();
    if(result.meta?.changes!==1)return fail(409,'revision_conflict');
    revision=expected+1;
  }
  try{await env.DB.prepare('INSERT INTO sync_events(id,owner_email,event_type,revision) VALUES(?,?,?,?)').bind(crypto.randomUUID(),email,expected===0?'created':'updated',revision).run();}catch(e){console.warn('sync_audit_failed');}
  return json({ok:true,revision},200,{etag:'"'+revision+'"'});
}
export default {
  async fetch(request,env,ctx){
    try{
      const url=new URL(request.url);
      if(url.pathname.startsWith('/api/'))return await handleAPI(request,env,ctx);
      if(!await identity(env,ctx))return fail(401,'cloudflare_access_required');
      return env.ASSETS?env.ASSETS.fetch(request):fail(503,'assets_not_bound');
    }catch(e){console.error('request_failed',e?.name||'unknown');return fail(500,'internal_error');}
  }
};