# Roadmap y límites

## Etapa 1: GitHub Pages + IndexedDB

Clientes, pedidos, checklist de calidad, seis propuestas editoriales, registro de aprobaciones, solicitud de cambios, entregas simuladas, importación/exportación JSON y pruebas Node.

Sin servicios externos ni suscripciones de IA. No usar datos privados de clientes: en esta etapa no hay autenticación ni cifrado de servidor. Los datos quedan en el navegador y requieren exportaciones periódicas.

## Etapa 2: Cloudflare Workers + D1 (antes de producción)

- Identidad OAuth/OIDC o Cloudflare Access, roles, auditoría y comprobación de permisos en backend.
- Migraciones versionadas para clientes, pedidos, entregables, aprobaciones, entregas e idempotencia.
- Reglas transaccionales server-side: ninguna entrega sin aprobación vigente; cambios invalidan aprobación.
- Importación voluntaria de IndexedDB a almacenamiento privado mediante HTTPS.
- Archivos privados en R2 con controles de tamaño y URLs temporales firmadas.
- CI, backups, pruebas de integración y restauración.

## Etapa 3: WhatsApp Business App coexistente (solo si es elegible)

- Comprobar elegibilidad de número, país y proveedor para Embedded Signup con coexistencia; no asumir compatibilidad.
- Resguardar chats antes de cualquier paso y explicar límites de sincronización.
- Webhooks oficiales verificados, deduplicación y políticas de Meta; sin scraping ni WhatsApp Web automatizado.
- Ningún envío ni publicación sin autorización explícita del propietario.

## Etapa 4: herramientas creativas opcionales

Conectar herramientas de imágenes, video, Canva e IA según necesidad; mantener funcionando las plantillas gratuitas locales como alternativa.
