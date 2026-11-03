// Optional cloud backup; use same-origin requests only from the private Access-protected Worker.
import {all,bulkRestore,STORES} from './db.mjs';
import {sanitizeImport} from './domain.mjs';
export class CloudError extends Error {constructor(message,code,status){super(message);this.code=code;this.status=status;}}
async function api(path,opts={}){
  const res=await fetch(path,{credentials:'same-origin',cache:'no-store',...opts,headers:{...opts.headers,accept:'application/json'}});
  if(!(res.headers.get('content-type')||'').includes('application/json'))throw new CloudError('La nube solo está disponible en el Worker privado, no en GitHub Pages.','not_cloud',res.status);
  const data=await res.json();
  if(!res.ok||!data.ok)throw new CloudError('Cloudflare: '+(data.error||'error'),data.error||'unknown',res.status);
  return data;
}
export const cloudStatus=()=>api('/api/v1/status');
export const cloudSnapshot=()=>api('/api/v1/snapshot');
export async function backupCloud(expectedRevision){
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw Error('Revisión inválida');
  const records=[];for(const store of STORES)for(const value of await all(store))records.push({store,value});
  return api('/api/v1/snapshot',{method:'PUT',headers:{'content-type':'application/json','if-match':'"'+expectedRevision+'"'},body:JSON.stringify({format:'mjon-command-backup-v1',records})});
}
export async function restoreCloud(){
  const data=await cloudSnapshot();
  if(!data.snapshot)return {revision:0,restored:0};
  const records=sanitizeImport(data.snapshot);
  await bulkRestore(records);
  return {revision:data.revision,restored:records.length};
}
