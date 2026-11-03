# MJON Marketing Command Center

**v0.1.0 — Local-first · Sin plataformas de IA de pago**

Panel responsive y PWA para organizar pedidos de marketing, clientes, producción editorial, revisión y aprobación humana antes de una entrega simulada.

## Características

- Clientes y sus notas de marca
- Pedidos con tipo, prioridad, brief y fecha de entrega
- Seis plantillas editoriales locales para copies, reels, CTA, imágenes y video
- Checklist de calidad, aprobación explícita y revocación cuando se realizan cambios
- Bandeja simulada para convertir un mensaje pegado en pedido
- Entregas simuladas solo tras aprobación
- Datos locales con IndexedDB, registros de actividad, respaldo y restauración JSON

## Desarrollo y pruebas

Requiere Node.js 22+ para pruebas y compilación, pero el frontend es JavaScript puro:

```sh
npm test
npm run check
npm run build
npm run start
```

El comando build genera `dist/`; el workflow de GitHub Actions verifica las pruebas y despliega en GitHub Pages cuando Pages usa **GitHub Actions** como fuente.

## Privacidad y límites

**No subir a este repositorio secretos, chats, números reales de clientes o respaldos.** GitHub Pages publica los archivos estáticos; los registros ingresados en la aplicación quedan en IndexedDB del navegador, sin sincronización ni cifrado de servidor. Usar solamente datos de prueba hasta añadir backend autenticado. Hacé copias de seguridad porque borrar los datos del navegador puede eliminar la información.

WhatsApp Business sigue desconectado. No se accede a los chats, no se envían mensajes ni se modifica el número. La futura coexistencia con Cloud API requiere verificación oficial con Meta, respaldos y aprobación expresa.

## Próximas etapas

Consultar [docs/ROADMAP.md](docs/ROADMAP.md): Cloudflare Workers + D1, autenticación, migraciones privadas, permisos server-side, integración oficial de WhatsApp y automatización supervisada.

## v0.2 — Respaldo privado opcional en Cloudflare

El código fuente incluye un Worker protegido por Cloudflare Access, una base D1 creada y la interfaz para respaldar/restaurar desde la versión privada del Worker. **La conexión todavía NO está habilitada:** Cloudflare Access debe activarse antes de desplegar. GitHub Pages continúa local y sin credenciales, y WhatsApp sigue desconectado.

Consultá [la guía de configuración Cloudflare](docs/CLOUD_V02.md). No uses datos privados reales hasta completar autenticación, pruebas de acceso y despliegue.
