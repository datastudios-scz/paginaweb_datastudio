# Seguridad

## Modelo de amenazas (sitio estático)

No hay backend, formularios, base de datos ni cookies. Los riesgos reales son:

1. **Inyección de scripts** (XSS) si algún día se agrega contenido de terceros → CSP estricta.
2. **Cadena de suministro**: dependencias npm o acciones de GitHub comprometidas → versiones exactas, lockfile, `npm ci`, acciones fijadas por SHA, Dependabot.
3. **Romper rutas registradas en plataformas** (Google/YouTube, TikTok, Meta) y perder verificaciones → rutas críticas verificadas en CI.
4. **Secuestro de dominio/HTTPS** → HTTPS forzado en Pages, CNAME verificado en CI.

## Content Security Policy

Astro genera un `<meta http-equiv="content-security-policy">` por página (`security.csp` en `astro.config.mjs`) con hashes SHA-256 de cada script y estilo en línea:

```
default-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self';
manifest-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self';
form-action 'self'; upgrade-insecure-requests;
script-src 'self' 'sha256-…'; style-src 'self' 'sha256-…'
```

Reglas para no romperla:

- **Nada de `style="…"` en el HTML** (se bloquea). Usar clases o, para valores dinámicos, `element.style.x = …` desde JS (CSSOM, permitido).
- **Nada de `define:vars`** en Astro (genera atributos `style`).
- **Sin scripts ni hojas externas** (CDN, Google Fonts, analítica). Si algún día se agregan, sumar el origen a la directiva correspondiente en `astro.config.mjs` y documentarlo aquí.
- Si se incrusta el portal de prueba u otro sitio en un `<iframe>`, cambiar `frame-src 'none'` por el origen exacto.
- La CSP **no funciona en `astro dev`**: probar siempre con `npm run build && npm run preview`. `npm run qa` reporta cualquier violación como error.

### Limitaciones de GitHub Pages (no hay cabeceras HTTP propias)

- `frame-ancestors`, `X-Frame-Options`, `Strict-Transport-Security`, `Permissions-Policy` y `X-Content-Type-Options` **no se pueden configurar** (una CSP por `<meta>` ignora `frame-ancestors`). Riesgo aceptado: el sitio no tiene acciones sensibles que proteger contra clickjacking.
- Si en el futuro se necesitan cabeceras, la salida es poner Cloudflare (proxy) delante de Pages o migrar a Cloudflare Pages/Netlify con `_headers`.

`<meta name="referrer" content="strict-origin-when-cross-origin">` está en todas las páginas.

## HTTPS

- Certificado de GitHub Pages para `datastudio.es` (Let's Encrypt, se renueva solo).
- **HTTPS forzado** (`https_enforced: true`) desde el 25/09/2026: `http://` redirige a `https://`.

## Cadena de suministro

- Dependencias con versión exacta (`--save-exact`) y `package-lock.json` versionado. CI instala con `npm ci`.
- npm 11 bloquea los *install scripts* no aprobados (p. ej. `esbuild`): **el build funciona sin ellos**; no aprobar scripts sin revisar.
- Acciones de GitHub **fijadas por commit SHA** con la versión en comentario. Dependabot propone las actualizaciones (npm y acciones), cada lunes.
- Permisos del workflow mínimos: `contents: read`, `pages: write`, `id-token: write`. `persist-credentials: false` en el checkout.
- `npm audit --omit=dev --audit-level=high` corre en CI (informativo, no bloquea).
- Ningún secreto en el repo (`.env*` en `.gitignore`). El sitio no necesita secretos.

## Enlaces externos

Todos los `target="_blank"` llevan `rel="noopener noreferrer"`.

## Cumplimiento con plataformas (YouTube / Google, TikTok, Meta)

Las apps de integración de Data Studio están verificadas con estas URLs, que **no pueden cambiar ni romperse**:

| URL | Archivo | Para qué |
| --- | --- | --- |
| `https://datastudio.es/` | `src/pages/index.astro` | Página de inicio de la app: debe describir la funcionalidad y enlazar la Política de Privacidad (sección Social Metrics BI + pie) |
| `https://datastudio.es/privacidad` | `public/privacidad/index.html` | Política de Privacidad (requisitos de YouTube API Services incluidos) |
| `https://datastudio.es/terminos` | `public/terminos/index.html` | Condiciones del Servicio |
| `https://datastudio.es/oauth/tiktok` | `public/oauth/tiktok/index.html` | Redirect URI de OAuth de TikTok |
| `https://datastudio.es/google5af846498ca551c6.html` | `public/…` | Verificación del dominio en Search Console |

- El home mantiene visible: qué datos se leen, solo lectura, solo cuentas autorizadas, uso interno, sin redistribución, revocable, y enlaces a Privacidad y Términos.
- Al editar las páginas legales, actualizar su fecha "Última actualización".
- El workflow falla si alguna de estas rutas no está en el build.

## Checklist antes de publicar

- [ ] `npm run build` sin errores ni advertencias nuevas
- [ ] `npm run qa` sin violaciones de CSP ni errores de consola
- [ ] Ningún `style="` nuevo en `src/` (`grep -rn 'style="' src/`; solo se permiten dentro de SVG estático sin atributo style)
- [ ] Enlaces externos con `rel="noopener noreferrer"`
- [ ] Rutas críticas intactas
