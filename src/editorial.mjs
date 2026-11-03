export function proposals({brand='',objective='',audience='',offer='',tone='cercano',channel='Instagram'}={}){
 const b=brand.trim()||'[marca]',o=offer.trim()||'[oferta]',a=audience.trim()||'[público]',g=objective.trim()||'[objetivo]';
 return [
 {kind:'copy',title:`Copy para ${channel}`,content:`¿Buscás ${g}? En ${b} tenemos ${o}.\n\nPensado para ${a}, en un tono ${tone}.\n\n📩 Escribinos para conocer más.\n\n[Revisar precios y afirmaciones antes de publicar]`},
 {kind:'guion',title:'Guion para Reel · 30 segundos',content:`0–3 s: gancho visual sobre ${g}.\n3–12 s: problema habitual de ${a}.\n12–23 s: mostrar ${o} con evidencias.\n23–30 s: CTA y cierre con marca ${b}.\nSubtítulos grandes y música con licencia.`},
 {kind:'cta',title:'Opciones de llamada a la acción',content:`• Consultanos por mensaje.\n• Pedí tu presupuesto.\n• Guardá esta publicación.\n• Conocé los detalles en nuestro perfil.`},
 {kind:'imagen',title:'Brief de diseño',content:`Marca: ${b}\nObjetivo: ${g}\nAudiencia: ${a}\nProducto/oferta: ${o}\nFormato: 1080×1350 feed / 1080×1920 historias.\nVerificar identidad visual, licencias y legibilidad.`},
 {kind:'video',title:'Brief de edición',content:`Video vertical 9:16 · 15–30 s.\nPrimer plano fuerte al inicio, subtítulos legibles, ritmo dinámico y CTA final.\nRevisar derechos de música, imagen y voz.\nTono: ${tone}.`},
 {kind:'brief',title:'Brief creativo consolidado',content:`Marca: ${b}\nObjetivo: ${g}\nPúblico: ${a}\nOferta: ${o}\nCanal: ${channel}\nTono: ${tone}\nFecha y restricciones: completar con cliente.`}];
}