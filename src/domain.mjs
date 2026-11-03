export const STAGES = ['nuevo','brief','produccion','revision','cambios','aprobado','entregado'];
export const TYPES = ['post','reel','video','imagen','copy','campana'];
export const PRIORITIES = ['baja','media','alta','urgente'];
export const QUALITY = ['Ortografía revisada','Marca y tono respetados','CTA claro','Formato correcto','Afirmaciones verificables','Brief completo'];
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
export function validOrder(order){
  if(!order?.title?.trim()) throw Error('El pedido necesita un título.');
  if(!order.clientId) throw Error('Seleccioná un cliente.');
  if(!TYPES.includes(order.type)) throw Error('Tipo inválido.');
  if(!PRIORITIES.includes(order.priority)) throw Error('Prioridad inválida.');
  return true;
}
export function transition(order, to, {approved=false, delivered=false}={}){
  if(!STAGES.includes(to)) throw Error('Etapa desconocida.');
  if(order.stage==='entregado') throw Error('Un pedido entregado es inmutable.');
  if(to==='aprobado' && !approved) throw Error('Aprobación explícita obligatoria.');
  if(to==='entregado' && (order.stage!=='aprobado'||!delivered)) throw Error('Solo se entrega tras una aprobación y confirmación.');
  if(to==='aprobado' && order.stage==='aprobado') throw Error('Ya está aprobado.');
  if(to==='entregado') return {...order,stage:to,deliveredAt:new Date().toISOString()};
  if(to==='aprobado') return {...order,stage:to,approvedAt:new Date().toISOString()};
  const invalidate = order.stage==='aprobado' || to==='cambios';
  return {...order,stage:to,approvedAt:invalidate?null:(order.approvedAt??null)};
}
export function canApprove(order, checklist, deliverables){
  return order.stage!=='entregado' && order.stage!=='aprobado' && QUALITY.every((_,i)=>checklist?.[i]) && deliverables.length>0;
}
export function canDeliver(order, approvals){
  return order.stage==='aprobado' && approvals.some(a=>a.orderId===order.id && a.active);
}
export function computeStats(orders){return {total:orders.length,active:orders.filter(o=>!['entregado','aprobado'].includes(o.stage)).length,review:orders.filter(o=>['revision','cambios'].includes(o.stage)).length,approved:orders.filter(o=>o.stage==='aprobado').length,delivered:orders.filter(o=>o.stage==='entregado').length};}
export function parseMessage(text){const t=(text||'').trim();if(!t)throw Error('Escribí el mensaje recibido.');return {title:t.split(/[\n.!?]/)[0].slice(0,90)||'Pedido desde WhatsApp',brief:t,type:/reel/i.test(t)?'reel':/video/i.test(t)?'video':/foto|imagen|flyer/i.test(t)?'imagen':/campaña|ads|publicidad/i.test(t)?'campana':'post'};}
export function sanitizeImport(payload){if(payload?.format!=='mjon-command-backup-v1'||!Array.isArray(payload.records))throw Error('Archivo de copia incompatible.');if(payload.records.length>10000)throw Error('La copia excede el límite de registros.');const allowed=['clients','orders','deliverables','approvals','audit','messages','settings'];return payload.records.filter(x=>allowed.includes(x.store)&&x.value?.id&&typeof x.value.id==='string');}
export function escapeHTML(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}