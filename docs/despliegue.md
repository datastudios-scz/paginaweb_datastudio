# Despliegue

## Cómo se publica

1. `git push` a `main`.
2. GitHub Actions (`.github/workflows/deploy.yml`): `npm ci` → `npm run build` → **verifica rutas críticas** → sube `dist/` → publica en GitHub Pages.
3. En ~1–2 minutos el cambio está en https://datastudio.es.

Ver ejecuciones: pestaña **Actions** del repo o `gh run list --repo datastudios-scz/paginaweb_datastudio`.

## Configuración de GitHub Pages

| Ajuste | Valor |
| --- | --- |
| Fuente | **GitHub Actions** (`build_type: workflow`). Antes era "rama main, raíz" (legacy) |
| Dominio | `datastudio.es` (archivo `public/CNAME`) |
| HTTPS forzado | Sí |
| Repo | `datastudios-scz/paginaweb_datastudio` (público) |

Consultar: `gh api repos/datastudios-scz/paginaweb_datastudio/pages`

## Dominio (Hostinger)

El dominio `datastudio.es` se compró en Hostinger y su DNS apunta a GitHub Pages:

- `A` de `datastudio.es` → 185.199.108.153 / .109.153 / .110.153 / .111.153 (y los `AAAA` 2606:50c0:8000–8003::153)
- `www.datastudio.es` → alias a GitHub Pages

No hace falta tocar nada en Hostinger para publicar. Si algún día se cambia de hosting, se cambian estos registros.

## Entorno local

Astro 7 necesita Node ≥ 22.12. En esta laptop el Node global es 20 (lo usan otros proyectos) y Node 24 está instalado con nvm **sin reemplazar el global**:

```bash
# Git Bash: usar Node 24 solo en esta terminal
export PATH="/c/Users/Dell/AppData/Local/nvm/v24.21.0:$PATH"
node --version        # v24.21.0

npm ci                # instalar dependencias exactas
npm run dev           # desarrollo con recarga (la CSP no aplica en dev)
npm run build         # compilar a dist/
npm run preview       # servir dist/ en http://localhost:4321 (con CSP)
npm run qa            # QA en 6 anchos (con preview corriendo)
npm run recursos      # regenerar favicons, íconos e imágenes OG
```

En PowerShell: `$env:Path = "C:\Users\Dell\AppData\Local\nvm\v24.21.0;" + $env:Path`.

## Volver atrás

- **Revertir un cambio**: `git revert <commit>` y `git push` (queda registrado; nunca `push --force` a `main`).
- **Re-publicar sin cambios**: Actions → "Publicar sitio" → *Run workflow*, o `gh workflow run deploy.yml`.
- **Emergencia** (el workflow no funciona): en Settings → Pages se puede volver a "Deploy from a branch", pero la rama `main` ya no tiene el HTML en la raíz. Lo correcto es arreglar el workflow; mientras tanto el último despliegue sigue en línea.
